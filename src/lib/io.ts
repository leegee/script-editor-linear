import { reviveItem } from "../components/CoreItems";
import { CharacterItem } from "../components/CoreItems/CharacterItem";
import { TimelineLocationItem } from "../components/CoreItems/Locations/LocationItem";
import { TimelineItemProps } from "../components/CoreItems/TimelineItem";
import { storage } from "../db";
import { setTimelineItems, setTimelineSequence, resetLocations, setCharacters, locations, characters, timelineItems, loadAll, addLocation, resetCharacters, addCharacter, deleteAllTimelineItems, clearAll } from "../stores";

export async function initNewScript() {
    await ingest([], [], []);
}

export async function loadSampleScript() {
    console.log('loadSampleScript enter');
    await loadJSONfromPath('/the-three-bears.json');
}

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

export async function loadJSONfromPath(jsonPath: string) {
    const response = await fetch(jsonPath);
    const data = await response.json();

    await ingest(data.script, data.characters, data.locations);
}

export async function ingest(
    sampleScript: TimelineItemProps[],
    sampleCharacters: CharacterItem[],
    sampleLocations: TimelineLocationItem[],
) {
    console.log("io/ingest: starting ingestion...");

    clearAll();

    const seq: string[] = [];

    for (const char of sampleCharacters) {
        addCharacter(char);
    }

    for (const loc of sampleLocations) {
        addLocation(loc);
    }

    for (const props of sampleScript) {
        const item = reviveItem(props);
        setTimelineItems(item.id, item);
        await storage.put("timelineItems", item);
        seq.push(item.id);
    }

    setTimelineSequence(seq);
    await storage.putMeta("timelineSequence", seq);

    await loadAll();

    console.log("Ingestion complete. Sequence length:", seq.length);
}
