import { createEffect, createSignal, For, onMount, Show } from "solid-js";
import DragDropList from "./components/DragDropList";
import { memScriptStore, reorderItems } from "./stores/memScriptStore";

export default function App() {
    const { items, sequence, loadScript } = memScriptStore;
    const [loaded, setLoaded] = createSignal(false);

    onMount(async () => {
        await loadScript();
        console.log('Loaded items:', items);
        console.log('Loaded sequence:', sequence());
        setLoaded(true);
    });

    createEffect(() => {
        console.log('change', Object.keys(items).length, sequence());
    });

    return (
        <main class="responsive">
            <Show when={loaded() && sequence()} fallback={<p>Loading script...</p>}>

                <DragDropList
                    items={sequence().map(id => items[id]?.instance).filter(Boolean)}
                    renderItem={(item) => item?.render() ?? null}
                    onReorder={(newOrder) => {
                        console.log('newOrder', newOrder)
                        memScriptStore.setSequence(newOrder.map(i => sequence()[i]));
                        reorderItems(memScriptStore.sequence());
                    }}
                />

            </Show>
        </main>
    );
}
