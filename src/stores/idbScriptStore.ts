// src/lib/idbScriptStorage.ts
import { openDB, type IDBPDatabase } from "idb";
import { BaseScriptItemProps } from "../classes/ScriptItem";
import { AllClassPropsUnion } from "../classes";

export const DB_NAME = "script-items-db";
export const DB_VERSION = 2; // Increment when schema changes
export const ITEMS_STORE = "items";
export const SEQUENCE_STORE = "sequence";

/**
 * Delete and fully reset the database.
 * Use only in dev/testing.
 */
export async function wipeDB(): Promise<void> {
    console.log("Wiping database for debugging...");
    await new Promise<void>((resolve, reject) => {
        const req = indexedDB.deleteDatabase(DB_NAME);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
        req.onblocked = () => console.warn("Database deletion blocked");
    });
}

/**
 * Open or create the database, ensuring both stores exist.
 */
async function openStore(): Promise<IDBPDatabase> {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            console.log(`[idb] Upgrading ${DB_NAME} to version ${DB_VERSION}`);
            if (db.objectStoreNames.contains(ITEMS_STORE)) db.deleteObjectStore(ITEMS_STORE);
            if (db.objectStoreNames.contains(SEQUENCE_STORE)) db.deleteObjectStore(SEQUENCE_STORE);

            db.createObjectStore(ITEMS_STORE);
            db.createObjectStore(SEQUENCE_STORE);
        },
    });
}

export const scriptStorage = {
    itemsKey: "default",

    async getItems(): Promise<Record<string, AllClassPropsUnion>> {
        const db = await openStore();
        const tx = db.transaction(ITEMS_STORE, "readonly");
        const store = tx.objectStore(ITEMS_STORE);
        const allKeys = await store.getAllKeys();
        const result: Record<string, AllClassPropsUnion> = {};
        for (const key of allKeys) {
            const item = await store.get(key);
            if (item) result[key.toString()] = item as AllClassPropsUnion;
        }
        await tx.done;
        db.close();
        return result;
    },

    async getSequence(): Promise<string[]> {
        const db = await openStore();
        const tx = db.transaction(SEQUENCE_STORE, "readonly");
        const store = tx.objectStore(SEQUENCE_STORE);
        const seq = (await store.get(this.itemsKey)) as string[] | undefined;
        await tx.done;
        db.close();
        return seq ?? [];
    },

    async addItem(item: AllClassPropsUnion) {
        const db = await openStore();

        // Store item
        {
            const tx = db.transaction(ITEMS_STORE, "readwrite");
            await tx.objectStore(ITEMS_STORE).put(item, item.id);
            await tx.done;
        }

        // Update sequence
        {
            const tx = db.transaction(SEQUENCE_STORE, "readwrite");
            const store = tx.objectStore(SEQUENCE_STORE);
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
            const tx = db.transaction(ITEMS_STORE, "readwrite");
            await tx.objectStore(ITEMS_STORE).delete(id);
            await tx.done;
        }

        // Update sequence
        {
            const tx = db.transaction(SEQUENCE_STORE, "readwrite");
            const store = tx.objectStore(SEQUENCE_STORE);
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
        const tx1 = db.transaction(ITEMS_STORE, "readwrite");
        await tx1.objectStore(ITEMS_STORE).clear();
        await tx1.done;

        const tx2 = db.transaction(SEQUENCE_STORE, "readwrite");
        await tx2.objectStore(SEQUENCE_STORE).clear();
        await tx2.done;

        db.close();
    },

    async reorderItems(newSequence: string[]) {
        const db = await openStore();
        const tx = db.transaction(SEQUENCE_STORE, "readwrite");
        await tx.objectStore(SEQUENCE_STORE).put(newSequence, this.itemsKey);
        await tx.done;
        db.close();
    },
};

