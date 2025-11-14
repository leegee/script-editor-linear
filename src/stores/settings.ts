import { createStore } from "solid-js/store";
import { storage, db } from "../db";

export const [settings, setSettings] = createStore<Record<string, any>>({});

export async function loadAllSettingsFromStorage() {
    const rows = await db.table("settings").toArray();

    const entries = Object.fromEntries(
        rows.map(r => [r.key, r.value])
    );

    setSettings(entries);
}

export async function updateSetting(key: string, value: any) {
    setSettings(key, value);
    await storage.put("settings", { key, value }); // upsert
}
