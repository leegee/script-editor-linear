import { reviveItem } from "../components/CoreItems";
import { CharacterItem } from "../components/CoreItems/CharacterItem";
import { CanonicalLocation } from "../components/CoreItems/Locations/CanonicalLocation";
import { TimelineItemProps } from "../components/CoreItems/TimelineItem";
import {
    locations,
    characters,
    timelineItems,
    loadAll,
    addLocation,
    addCharacter,
    createTimelineItem as storeCreateTimelineItem,
    clearAll,
    reorderTimeline
} from "../stores";

/**
 * Initialize a new empty script
 */
export async function initNewScript() {
    await ingest([], [], []);
}

/**
 * Download current script as JSON
 */
export function downloadJSON() {
    const jsonStr = JSON.stringify(serialiseAll(), null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "script.json";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(link.href);
}

/**
 * Serialise all store data
 */
function serialiseAll() {
    return {
        locations: Object.values(locations).map(value => ({ ...value })),
        characters: Object.values(characters).map(value => ({ ...value })),
        script: Object.values(timelineItems).map(value => ({ ...value })),
    };
}

/**
 * Load JSON file from a path and ingest it
 */
export async function loadJSONfromPath(jsonPath: string) {
    const response = await fetch(jsonPath);
    const data = await response.json();

    await ingest(data.script, data.characters, data.locations);
}

/**
 * Ingest arrays of timeline items, characters, and locations into the store
 */
export async function ingest(
    sampleScript: TimelineItemProps[],
    sampleCharacters: CharacterItem[],
    sampleLocations: CanonicalLocation[],
) {
    console.log("io/ingest: starting ingestion...");

    // Clear all existing data
    clearAll();

    // Add characters and locations first
    for (const char of sampleCharacters) addCharacter(char);
    for (const loc of sampleLocations) addLocation(loc);

    // Add timeline items using store API (handles sequence & storage)
    const seq: string[] = [];
    for (const props of sampleScript) {
        const item = reviveItem(props);
        if (!item.id) item.id = crypto.randomUUID();
        await storeCreateTimelineItem(item);
        seq.push(item.id);
    }

    // Ensure sequence is consistent with store
    await reorderTimeline(seq);

    // Reload all derived data
    await loadAll();

    console.log("Ingestion complete. Sequence length:", seq.length);
}
