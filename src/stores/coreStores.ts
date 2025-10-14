import { createStore } from "solid-js/store";
import { createSignal } from "solid-js";
import { ScriptItem, ScriptItemProps } from "../classes/CoreItems";
import { storage } from "../db";

// -------------------- Reactive stores --------------------
export const [scriptItems, setScriptItems] = createStore<Record<string, ScriptItem>>({});
export const [sequence, setSequence] = createSignal<string[]>([]);

export async function loadAll() {
    const items = await storage.getAll<ScriptItemProps>("scriptItems");
    const revived = Object.fromEntries(
        Object.entries(items).map(([id, props]) => [id, new ScriptItem(props)])
    );
    setScriptItems(revived);

    const savedSeq = await storage.getMeta<string[]>("sequence");
    if (savedSeq && savedSeq.length) {
        setSequence(savedSeq);
    } else {
        throw new Error('No sequence stored?')
        setSequence(Object.keys(revived));
    }
}

// CRUD
export async function addScriptItem(item: ScriptItem) {
    setScriptItems(item.id, item);
    const seq = [...sequence(), item.id];
    setSequence(seq);
    await storage.put("scriptItems", item);
    await storage.putMeta("sequence", seq);  // persist every update
}

export async function reorderScriptItems(newSeq: string[]) {
    setSequence(newSeq);
    await storage.putMeta("sequence", newSeq); // persist reorder
}

export async function removeScriptItem(id: string) {
    setScriptItems(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
    });
    setSequence(sequence().filter(x => x !== id));
    await storage.delete("scriptItems", id);
}

