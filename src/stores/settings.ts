import { createStore } from "solid-js/store";
import { storage, db } from "../db";

export const [settings, setSettings] = createStore<Record<string, any>>({});

async function putSetting(key: string, value: any) {
    await storage.put("settings", { key, value });
}

async function getSettings(): Promise<Record<string, any>> {
    const allEntries = await storage.getAll<{ key: string; value: any }>("settings");
    return Object.fromEntries(
        Object.entries(allEntries)
            .filter(([_, item]) => item?.value !== undefined)
            .map(([key, item]) => [key, item.value])
    );
}

export async function loadAllSettingsFromStorage() {
    const items = await getSettings();
    setSettings(items);
}

export async function updateSetting(key: string, value: any) {
    setSettings(key, value);
    await putSetting(key, value);
}
