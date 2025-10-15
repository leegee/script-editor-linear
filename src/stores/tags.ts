import { createStore } from "solid-js/store";
import { Tag } from "../classes/CoreItems";
import { storage } from "../db";

export const [tags, setTags] = createStore<Record<string, Tag>>({});

export async function loadAllTags() {
    const items = await storage.getAll<Tag>("tags");
    const revived = Object.fromEntries(
        Object.entries(items).map(([id, obj]) => [id, new Tag(obj)])
    );
    setTags(revived);
}

export async function addTag(item: Tag) {
    setTags(item.id, item);
    await storage.put("tags", item);
}

export async function removeTag(id: string) {
    setTags(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
    });
    await storage.delete("tags", id);
}
