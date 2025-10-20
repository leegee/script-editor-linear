import { reviveItem } from "../components/CoreItems";
import { CharacterItem } from "../components/CoreItems/CharacterItem";
import { LocationItem } from "../components/CoreItems/LocationItem";
import { TimelineItemProps, TimelineItem } from "../components/CoreItems/TimelineItem";
import { storage } from "../db";
import { setTimelineItems, setTimelineSequence, setLocations, setCharacters } from "../stores";

export async function ingest(
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
