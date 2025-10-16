import { TimelineItemProps, ActItem, SceneItem, DialogueItem, LocationItem, Character, TimelineItem } from "../components/CoreItems";
import { storage } from "../db";
import { setTimelineItems, setTimelineSequence, setLocations, setCharacters } from "../stores";

export async function ingest(
    sampleScript: TimelineItemProps[],
    sampleCharacters: Character[],
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
        let item: TimelineItem;

        switch (props.type) {
            case "act":
                item = new ActItem(props);
                break;
            case "scene":
                item = new SceneItem(props);
                break;
            case "dialogue":
                item = new DialogueItem(props);
                break;
            case "location":
                item = new LocationItem(props);
                break;
            default:
                item = new TimelineItem(props);
        }

        setTimelineItems(item.id, item);
        await storage.put("timelineItems", item);
        seq.push(item.id);
    }

    setTimelineSequence(seq);
    await storage.putMeta("timelineSequence", seq);

    console.log("Ingestion complete. Sequence length:", seq.length);
}
