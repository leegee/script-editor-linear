import { storage } from "../db";
import { ActItem, Character, DialogueItem, LocationItem, SceneItem, ScriptItem, type ScriptItemProps } from "../classes/CoreItems";
import { setScriptItems, locations, setLocations, setCharacters, setSequence } from "../stores/index";

export async function ingest(
    sampleScript: ScriptItemProps[],
    sampleCharacters: Character[],
    sampleLocations: LocationItem[],
) {
    console.log("Starting ingestion of Three Bears...");

    // Clear all tables and stores
    await Promise.all([
        storage.clearTable("scriptItems"),
        storage.clearTable("locations"),
        storage.clearTable("characters")
    ]);
    setScriptItems({});
    setLocations({});
    setCharacters({});
    setSequence([]);

    const seq: string[] = [];

    // Add characters
    for (const char of sampleCharacters) {
        setCharacters(char.id, char);
        await storage.put("characters", char);
    }

    // Add locations
    for (const loc of sampleLocations) {
        setLocations(loc.id, loc);
        await storage.put("locations", loc);
    }

    // Add script items
    for (const props of sampleScript) {
        let item: ScriptItem;

        switch (props.type) {
            case "act":
                item = new ActItem(props);
                break;
            case "scene":
                item = new SceneItem(props);
                break;
            case "dialogue":
                // Expand location reference if present
                const dialogueProps = { ...props };
                const locId = props.details?.locationId;
                if (locId && Object.prototype.hasOwnProperty.call(locations, locId)) {
                    dialogueProps.details = {
                        ...dialogueProps.details,
                        locationTitle: locations[locId].title
                    };
                }
                item = new DialogueItem(dialogueProps);
                break;
            case "location":
                const locationProps = { ...props };
                const locRefId = props.details?.locationId;
                let existingLoc;
                if (locRefId && Object.prototype.hasOwnProperty.call(locations, locRefId)) {
                    existingLoc = locations[locRefId];
                }
                item = new LocationItem({
                    ...locationProps,
                    title: existingLoc?.title ?? props.title,
                    details: existingLoc?.details ?? props.details
                });
                break;

            default:
                item = new ScriptItem(props);
        }

        // Save to store and IndexedDB
        if (props.type === "location") {
            setLocations(item.id, item as LocationItem);
            await storage.put("locations", item);
        } else {
            setScriptItems(item.id, item as ScriptItem);
            await storage.put("scriptItems", item);
            seq.push(item.id);
        }
    }

    setSequence(seq);
    await storage.putMeta("sequence", seq);

    console.log("Three Bears ingestion complete. Sequence length:", seq.length);
}
