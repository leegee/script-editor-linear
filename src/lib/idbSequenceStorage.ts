// src/lib/idbSequenceStorage.ts
import type { AsyncStorage } from "@solid-primitives/storage";
import { openDB, type IDBPDatabase } from "idb";

/**
 * Helper to open or create the database
 */
async function openStore(): Promise<IDBPDatabase> {
    return openDB("script-items-db", 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains("sequence")) {
                db.createObjectStore("sequence");
            }
        },
    });
}

/**
 * AsyncStorage implementation for a sequence of GUIDs
 */
export const sequenceStorage: AsyncStorage = {
    getItem: async (key) => {
        const db = await openStore();
        const tx = db.transaction("sequence", "readonly");
        const store = tx.objectStore("sequence");
        const result = await store.get(key);
        await tx.done;
        db.close();
        // If nothing is stored yet, return an empty array
        return result ?? [];
    },

    setItem: async (key, value) => {
        const db = await openStore();
        const tx = db.transaction("sequence", "readwrite");
        const store = tx.objectStore("sequence");
        // value should be an array of strings (GUIDs)
        await store.put(value, key);
        await tx.done;
        db.close();
    },

    removeItem: async (key) => {
        const db = await openStore();
        const tx = db.transaction("sequence", "readwrite");
        const store = tx.objectStore("sequence");
        await store.delete(key);
        await tx.done;
        db.close();
    },
};
