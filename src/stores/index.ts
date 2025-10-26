import { loadAllCharacters, resetCharacters } from "./characters";
import { loadAllLocations, resetLocations } from "./locations";
import { loadAllNotes } from "./notes";
import { loadAllTimelineItems, deleteAllTimelineItems } from "./timelineItems";
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
    await loadAllTimelineItems();
    await loadAllLocations();
    await loadAllCharacters();
    await loadAllTags();
    await loadAllNotes();
    console.log("stores/loadAll: all stores loaded from IndexedDB.");
}

export async function clearAll() {
    console.log('stores/clearAll: Enter')
    await Promise.all([
        deleteAllTimelineItems(),
        resetLocations(),
        resetCharacters
        // resetTags(),
        // resetNotes(),
    ]);
    console.log("stores/clearAll: all stores wiped in IndexedDB.");
}
