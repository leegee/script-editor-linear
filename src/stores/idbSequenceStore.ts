// src/lib/idbSequenceStorage.ts
import type { AsyncStorage } from "@solid-primitives/storage";
import { openDB, type IDBPDatabase } from "idb";
import { DB_NAME, SEQUENCE_STORE } from "./idbScriptStore";

/**
 * Helper to open or create the database
 */
async function openStore(): Promise<IDBPDatabase> {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(SEQUENCE_STORE)) {
                db.createObjectStore(SEQUENCE_STORE);
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
        const tx = db.transaction(SEQUENCE_STORE, "readonly");
        const store = tx.objectStore(SEQUENCE_STORE);
        const result = await store.get(key);
        await tx.done;
        db.close();
        // If nothing is stored yet, return an empty array
        return result ?? [];
    },

    setItem: async (key, value) => {
        const db = await openStore();
        const tx = db.transaction(SEQUENCE_STORE, "readwrite");
        const store = tx.objectStore(SEQUENCE_STORE);
        // value should be an array of strings (GUIDs)
        await store.put(value, key);
        await tx.done;
        db.close();
    },

    removeItem: async (key) => {
        const db = await openStore();
        const tx = db.transaction(SEQUENCE_STORE, "readwrite");
        const store = tx.objectStore(SEQUENCE_STORE);
        await store.delete(key);
        await tx.done;
        db.close();
    },
};
