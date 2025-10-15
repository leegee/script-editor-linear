import { loadAllCharacters } from "./characters";
import { loadAllLocations } from "./locations";
import { loadAllNotes } from "./notes";
import { loadAllScriptItems } from "./scriptItems";
import { loadAllTags } from "./tags";

export * from "./scriptItems";
export * from "./locations";
export * from "./characters";
export * from "./tags";
export * from "./notes";

/** 
 * Loads all data from IndexedDB into the stores.
 * Use this on app startup.
 */
export async function loadAll() {
    await Promise.all([
        loadAllScriptItems(),
        loadAllLocations(),
        loadAllCharacters(),
        loadAllTags(),
        loadAllNotes(),
    ]);
    console.log("All stores loaded from IndexedDB.");
}

