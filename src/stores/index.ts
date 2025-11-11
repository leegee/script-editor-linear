import { loadAllCharacters as loadAllCharactersFromStorage, } from "./characters";
import { loadAllLocationsFromStorage as loadAllLocationsFromStorage, } from "./locations";
import { loadAllNotesFromStorage } from "./notes";
import { loadAllTimelineItemsFromStorage, } from "./timelineItems";
import { loadAllTags as loadAllTagsFromStorage } from "./tags";
import { storage } from "../db";

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
    await loadAllTimelineItemsFromStorage();
    await loadAllLocationsFromStorage();
    await loadAllCharactersFromStorage();
    await loadAllTagsFromStorage();
    await loadAllNotesFromStorage();
    console.log("stores/loadAll: all stores loaded from IndexedDB.");
}

export async function clearAll() {
    console.log('stores/clearAll: Enter')
    await storage.deleteDatabase();
    console.log("stores/clearAll: all stores wiped in IndexedDB.");
}
