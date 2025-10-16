import Dexie from "dexie";

export const db = new Dexie("ScriptDB");

db.version(1).stores({
    timelineItems: "id,type,startTime",
    characters: "id,name",
    locations: "id,name",
    tags: "id,name",
    notes: "id,parentId,parentType",
    meta: "key",
});

export type TableName = "timelineItems" | "characters" | "locations" | "tags" | "notes";

export const storage = {
    async getAll<T>(table: TableName): Promise<Record<string, T>> {
        const all = await db.table(table).toArray();
        return Object.fromEntries(all.map(i => [i.id, i])) as Record<string, T>;
    },
    async getKeys(table: TableName): Promise<string[]> {
        const all = await db.table(table).toArray();
        return all.map(i => i.id);
    },
    async put<T>(table: TableName, item: T) {
        await db.table(table).put(item);
    },
    async delete(table: TableName, id: string) {
        await db.table(table).delete(id);
    },
    async clearTable(table: TableName) {
        const keys = await storage.getKeys(table);
        for (const key of keys) {
            await storage.delete(table, key);
        }
    },
    async putMeta<T>(key: string, value: T) {
        await db.table("meta").put({ key, value });
    },
    async getMeta<T>(key: string): Promise<T | undefined> {
        const entry = await db.table("meta").get(key);
        return entry?.value as T | undefined;
    },
};
