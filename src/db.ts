import Dexie from "dexie";

export const db = new Dexie("ScriptDB");

export type TableName = "timelineItems" | "characters" | "locations" | "tags" | "notes" | "settings";

export const storage = {
    async createDatabase() {
        db.version(1).stores({
            timelineItems: "id,type",
            characters: "id,title",
            locations: "id,title",
            tags: "id,title",
            notes: "id,title",
            meta: "key",
            settings: "key",
        });
        await db.open();
    },
    async deleteDatabase() {
        await db.delete();
        console.log("Database deleted");
        await storage.createDatabase();
    },

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
        await db.table(table).clear();
    },
    async putMeta<T>(key: string, value: T) {
        await db.table("meta").put({ key, value });
    },
    async getMeta<T>(key: string): Promise<T | undefined> {
        const entry = await db.table("meta").get(key);
        return entry?.value as T | undefined;
    },
};

await storage.createDatabase();
