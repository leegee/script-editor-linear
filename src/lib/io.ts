import { reviveItem } from "../components/CoreItems";
import { CharacterItem } from "../components/CoreItems/CharacterItem";
import { LocationItem } from "../components/CoreItems/LocationItem";
import { TimelineItemProps } from "../components/CoreItems/TimelineItem";
import { storage } from "../db";
import { setTimelineItems, setTimelineSequence, setLocations, setCharacters, locations, characters, timelineItems } from "../stores";


export function downloadJSON() {
    const jsonStr = JSON.stringify(serialiseAll(), null, 2);
    console.log(jsonStr)
    const blob = new Blob([jsonStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "script.json";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(link.href);
}

function serialiseAll() {
    return {
        locations: Object.entries(locations).map(([, value]) => ({ ...value })),
        characters: Object.entries(characters).map(([, value]) => ({ ...value })),
        script: Object.entries(timelineItems).map(([, value]) => ({ ...value })),
    };
}

export async function ingestJSON(jsonPath: string) {
    const response = await fetch(jsonPath);
    const data = await response.json();

    await _ingest(data.script, data.characters, data.locations);
}


async function _ingest(
    sampleScript: TimelineItemProps[],
    sampleCharacters: CharacterItem[],
    sampleLocations: LocationItem[],
) {
    console.log("Starting ingestion...");

    // Clear stores and tables
    await Promise.all([
        storage.clearTable("timelineItems"),
        storage.clearTable("locations"),
        storage.clearTable("characters")
    ]);
    setTimelineItems({});
    setLocations({});
    setCharacters({});
    setTimelineSequence([]);

    const seq: string[] = [];

    for (const char of sampleCharacters) {
        setCharacters(char.id, char);
        await storage.put("characters", char);
    }

    for (const loc of sampleLocations) {
        setLocations(loc.id, loc);
        await storage.put("locations", loc);
    }

    for (const props of sampleScript) {
        const item = reviveItem(props);
        setTimelineItems(item.id, item);
        await storage.put("timelineItems", item);
        seq.push(item.id);
    }

    setTimelineSequence(seq);
    await storage.putMeta("timelineSequence", seq);

    console.log("Ingestion complete. Sequence length:", seq.length);
}
