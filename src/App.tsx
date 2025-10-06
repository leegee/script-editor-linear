// src/App.tsx
import { createSignal, createMemo, For, onMount } from "solid-js";
import DragDropList from "./components/DragDropList";
import { items, sequence, loadScript, reorderItems as persistReorder } from "./stores/memScriptStore";

export default function App() {
    const [loaded, setLoaded] = createSignal(false);

    onMount(async () => {
        await loadScript();
        // give Solid a microtask to ensure store updates propagate before showing the UI
        queueMicrotask(() => setLoaded(true));
    });

    // build an items array in the same order as sequence()
    const itemsArray = createMemo(() =>
        sequence().map(id => ({ id, item: items[id]?.instance ?? null }))
    );

    // convert DragDropList new order (indices) back into GUID sequence and persist
    function handleReorder(newOrderIndices: number[]) {
        const arr = itemsArray();
        const newSequence = newOrderIndices.map(i => arr[i].id);
        // persist the new sequence to DB + store
        persistReorder(newSequence).catch(console.error);
    }

    return (
        <main>
            {!loaded() ? (
                <p>Loading script...</p>
            ) : (
                <DragDropList
                    items={itemsArray()}
                    renderItem={(entry: { id: string; item: any }) =>
                        entry.item ? entry.item.render() : <div class="placeholder">Missing</div>
                    }
                    onReorder={handleReorder}
                />
            )}
        </main>
    );
}
