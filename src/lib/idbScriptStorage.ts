// src/lib/idbScriptStorage.ts
import type { AsyncStorage } from "@solid-primitives/storage";
import { openDB, type IDBPDatabase } from "idb";

export interface ScriptItemJSON {
    id: string;
    time: number;
    type: string;
    text: string;
    [key: string]: any;
}

/**
 * Open or create the database
 */
async function openStore(): Promise<IDBPDatabase> {
    return openDB("script-items-db", 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains("items")) {
                db.createObjectStore("items");
            }
            if (!db.objectStoreNames.contains("sequence")) {
                db.createObjectStore("sequence");
            }
        },
    });
}

/**
 * keeps items and their order (sequence) in sync
 */
export const scriptStorage = {
    itemsKey: "default", // key for sequence store

    async getItems(): Promise<Record<string, ScriptItemJSON>> {
        const db = await openStore();
        const tx = db.transaction("items", "readonly");
        const store = tx.objectStore("items");
        const allKeys = await store.getAllKeys();
        const result: Record<string, ScriptItemJSON> = {};
        for (const key of allKeys) {
            const item = await store.get(key);
            if (item) result[key.toString()] = item as ScriptItemJSON;
        }
        await tx.done;
        db.close();
        return result;
    },

    async getSequence(): Promise<string[]> {
        const db = await openStore();
        const tx = db.transaction("sequence", "readonly");
        const store = tx.objectStore("sequence");
        const seq = (await store.get(this.itemsKey)) as string[] | undefined;
        await tx.done;
        db.close();
        return seq ?? [];
    },

    async addItem(item: ScriptItemJSON) {
        const db = await openStore();

        // Store item
        {
            const tx = db.transaction("items", "readwrite");
            const store = tx.objectStore("items");
            await store.put(item, item.id);
            await tx.done;
        }

        // Update sequence
        {
            const tx = db.transaction("sequence", "readwrite");
            const store = tx.objectStore("sequence");
            const seq = (await store.get(this.itemsKey)) as string[] | undefined;
            const newSeq = seq ? [...seq, item.id] : [item.id];
            await store.put(newSeq, this.itemsKey);
            await tx.done;
        }

        db.close();
    },

    async removeItem(id: string) {
        const db = await openStore();

        // Remove item
        {
            const tx = db.transaction("items", "readwrite");
            const store = tx.objectStore("items");
            await store.delete(id);
            await tx.done;
        }

        // Update sequence
        {
            const tx = db.transaction("sequence", "readwrite");
            const store = tx.objectStore("sequence");
            const seq = (await store.get(this.itemsKey)) as string[] | undefined;
            if (seq) {
                const newSeq = seq.filter((x) => x !== id);
                await store.put(newSeq, this.itemsKey);
            }
            await tx.done;
        }

        db.close();
    },

    async clear() {
        const db = await openStore();
        await db.transaction("items", "readwrite").objectStore("items").clear();
        await db.transaction("sequence", "readwrite").objectStore("sequence").clear();
        db.close();
    },

    async reorderItems(newSequence: string[]) {
        const db = await openStore();
        const tx = db.transaction("sequence", "readwrite");
        const store = tx.objectStore("sequence");
        await store.put(newSequence, this.itemsKey);
        await tx.done;
        db.close();
    },
};
