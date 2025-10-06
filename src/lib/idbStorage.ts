// src/lib/idbStorage.ts
import type { AsyncStorage } from "@solid-primitives/storage";
import { openDB, type IDBPDatabase } from "idb";

// Helper to open or create the database
async function openStore(): Promise<IDBPDatabase> {
    return openDB("script-items-db", 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains("store")) {
                db.createObjectStore("store");
            }
        },
    });
}

// Define IndexedDB-backed async storage object
export const idbStorage: AsyncStorage = {
    getItem: async (key) => {
        const db = await openStore();
        const tx = db.transaction("store", "readonly");
        const store = tx.objectStore("store");
        const result = await store.get(key);
        await tx.done;
        db.close();
        return result ?? null;
    },
    setItem: async (key, value) => {
        const db = await openStore();
        const tx = db.transaction("store", "readwrite");
        const store = tx.objectStore("store");
        store.put(value, key);
        await tx.done;
        db.close();
    },
    removeItem: async (key) => {
        const db = await openStore();
        const tx = db.transaction("store", "readwrite");
        const store = tx.objectStore("store");
        store.delete(key);
        await tx.done;
        db.close();
    },
};
