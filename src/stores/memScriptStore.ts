import { createStore } from "solid-js/store";
import { createSignal } from "solid-js";
import { BaseItem } from "../classes/BaseItem";
import { Act } from "../classes/Act";
import { Scene } from "../classes/Scene";
import { Dialogue, type DialoguePropsType } from "../classes/Dialogue";
import { Location, type LocationPropsType } from "../classes/Location";

import { scriptStorage } from "./idbScriptStore";

function reviveItem(obj: any) {
    switch (obj.type) {
        case "act": return new Act(obj);
        case "scene": return new Scene(obj);
        case "dialogue": return new Dialogue(obj as DialoguePropsType);
        case "location": return new Location(obj as LocationPropsType);
        default: return new BaseItem(obj);
    }
}

// Reactive memory store
export const [items, setItems] = createStore<Record<string, { instance: BaseItem }>>({});
export const [sequence, setSequence] = createSignal<string[]>([]);

export const memScriptStore = { items, setItems, sequence, setSequence, loadScript };

export async function loadScript() {
    const itemData = await scriptStorage.getItems();
    const seqData = await scriptStorage.getSequence();

    const instances = Object.fromEntries(
        Object.entries(itemData).map(([id, d]) => [id, { instance: reviveItem(d) }])
    );

    setItems(instances);
    setSequence(seqData.filter(id => id in instances)); // only keep valid IDs
}

export async function addItem(item: BaseItem) {
    setItems(item.props.id, { instance: item });
    setSequence([...sequence(), item.props.id]);
    await scriptStorage.addItem(item.props);
}

export async function removeItem(id: string) {
    setItems(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
    });
    setSequence(sequence().filter(x => x !== id));
    await scriptStorage.removeItem(id);
}

export async function reorderItems(newSeq: string[]) {
    await scriptStorage.reorderItems(newSeq);
}

