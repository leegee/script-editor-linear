import { createSignal, createEffect, For, onMount, Show } from "solid-js";
import { items, sequence, loadScript } from "./stores/sciptStore";
import DragDropList from "./components/DragDropList";

export default function App() {
    const [loaded, setLoaded] = createSignal(false);

    onMount(async () => {
        await loadScript();
        queueMicrotask(() => {
            setLoaded(true);
            console.log(JSON.stringify({ items, sequence: sequence() }));
        });
    });

    createEffect(() => {
        console.log("Sequence:", sequence());
        console.log("Items:", JSON.stringify(items)); // triggers tracking
    });

    return (
        <main>
            <Show when={loaded()} fallback={<p>Loading script...</p>}>
                <DragDropList>
                    <For each={sequence()}>
                        {(id) => {
                            const item = () => items[id]?.instance;
                            return (
                                <Show when={item()}>
                                    <div>{item().render()}</div>
                                </Show>
                            );
                        }}
                    </For>
                </DragDropList>
            </Show>
        </main>
    );
}
