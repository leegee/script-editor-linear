import { loadAllCharacters } from "./characters";
import { loadAllLocations } from "./locations";
import { loadAllNotes } from "./notes";
import { loadAllTimelineItems } from "./timelineItems";
import { loadAllTags } from "./tags";

export * from "./timelineItems";
export * from "./locations";
export * from "./characters";
export * from "./tags";
export * from "./notes";

/** 
 * Loads all data from IndexedDB into the stores.
 */
export async function loadAll() {
    console.log('stores/loadAll: Enter')
    await Promise.all([
        loadAllTimelineItems(),
        loadAllLocations(),
        loadAllCharacters(),
        loadAllTags(),
        loadAllNotes(),
    ]);
    console.log("stores/loadAll: all stores loaded from IndexedDB.");
}

