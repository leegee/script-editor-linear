import { createStore, unwrap } from "solid-js/store";
import { storage } from "../db";

export interface TagType {
    id: string;
    title: string;
    details: {
        [key: string]: any;
    };
}

export const [tags, setTags] = createStore<Record<string, TagType>>({});

export async function loadAllTags() {
    const items = await storage.getAll<TagType>("tags");
    const revived = Object.fromEntries(
        Object.entries(items).map(([id, obj]) => [id, obj as TagType])
    );
    setTags(revived);
}

export async function resetTags() {
    await storage.clearTable("tags");
    setTags({});
}

export function addTag(obj: Partial<TagType>): TagType {
    if ("ref" in obj) {
        throw new TypeError("createTag fields should not contain ref");
    }

    const tag: TagType = {
        id: obj.id ?? crypto.randomUUID(),
        title: obj.title ?? "New tag",
        details: obj.details ? { ...obj.details } : {},
    };

    setTags(tag.id, tag);
    storage.put("tags", tag);

    return tag;
}

export function patchTag(id: string, updatedFields: Partial<TagType>) {
    const prev = unwrap(tags[id]) as TagType | undefined;
    if (!prev) throw new Error("Cannot patch non-existent tag: " + id);

    const merged: TagType = {
        ...prev,
        ...updatedFields,
        details: {
            ...prev.details,
            ...(updatedFields.details ?? {}),
        },
    };

    setTags(id, merged);
    storage.put("tags", unwrap(merged));
}


export async function removeTag(id: string) {
    setTags(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
    });
    await storage.delete("tags", id);
}

export function getTag(id: string): TagType | undefined {
    return tags[id];
}

export function resolveTagRef(item: { details?: { ref?: string }; id?: string }): TagType | undefined {
    const ref = item.details?.ref ?? item.id;
    return ref ? tags[ref] : undefined;
}
