import { createStore } from "solid-js/store";
import { createRoot, createSignal, onMount } from "solid-js";
import { scriptStorage, type ScriptItemProps } from "../lib/idbScriptStorage";
import { BaseScriptItem } from "../classes/ScriptItem";
import { Act } from "../classes/Act";
import { Scene } from "../classes/Scene";
import { Dialogue, DialoguePropsType } from "../classes/Dialogue";

function reviveItem(obj: ScriptItemProps) {
    switch (obj.type) {
        case "act": return new Act(obj);
        case "scene": return new Scene(obj);
        case "dialogue": return new Dialogue(obj as DialoguePropsType);
        default: return new BaseScriptItem(obj);
    }
}

// Reactive stores
export const [items, setItems] = createStore<Record<string, { instance: BaseScriptItem }>>({});
export const [sequence, setSequence] = createSignal<string[]>([]);

export async function loadScript() {
    const loadedItems = await scriptStorage.getItems();
    const loadedSequence = await scriptStorage.getSequence();

    const instances = Object.fromEntries(
        Object.entries(loadedItems).map(([id, data]) => [
            id,
            { instance: reviveItem(data) }
        ])
    );

    // Ensure the updates happen inside Solid’s reactive context
    createRoot(() => {
        setItems(instances);
        setSequence(loadedSequence.filter(id => id in instances));
    });
}

export async function addItem(item: BaseScriptItem) {
    await scriptStorage.addItem(item.toJSON());
    setItems(item.props.id, { instance: item });
    setSequence([...sequence(), item.props.id]);
}

export async function removeItem(id: string) {
    await scriptStorage.removeItem(id);
    setItems(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
    });
    setSequence(sequence().filter((x) => x !== id));
}

export async function reorderItems(newSeq: string[]) {
    await scriptStorage.reorderItems(newSeq);
    setSequence(newSeq);
}

onMount(() => {
    loadScript().catch(err => console.error("Failed to load script:", err));
});
