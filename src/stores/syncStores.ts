import { createEffect, onCleanup } from "solid-js";

/**
 * Synchronizes a reactive in-memory store with a persistent IndexedDB store.
 * 
 * @param memStore - An object with reactive Solid stores (e.g., { items, sequence })
 * @param idbStore - An object with async load/save methods
 */
export function syncStores(memStore: any, idbStore: any) {
    let initialized = false;

    // Load initial data from IndexedDB into memory
    idbStore.getItems().then((data: any) => {
        if (data) {
            memStore.setItems(data.items ?? {});
            memStore.setSequence(data.sequence ?? []);
        }
        initialized = true;
    });

    //  Watch for changes in the memory store and persist them
    createEffect(() => {
        if (!initialized) return;

        const items = memStore.items;
        const sequence = memStore.sequence;

        // Persist to IndexedDB
        idbStore.saveData({ items, sequence });
    });

    // Optional: cleanup hook if you want to flush explicitly on unmount
    onCleanup(async () => {
        await idbStore.saveData({
            items: memStore.items,
            sequence: memStore.sequence
        });
    });
}
