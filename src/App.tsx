import { onMount, createSignal, Show } from "solid-js";
import DragDropList from "./components/DragDropList";
import { scriptItems, sequence, setSequence, loadAll, reorderScriptItems } from "./stores/coreStores";
import { ingest } from "./scripts/TheThreeBears";

export default function App() {
    const [loaded, setLoaded] = createSignal(false);

    onMount(async () => {
        await ingest();   // Populate the DB + store
        await loadAll();            // Load everything into reactive store
        setLoaded(true);            // Allow <Show> to render
    });

    return (
        <main class="responsive">
            <Show when={loaded()} fallback={<p>Loading script...</p>}>
                <DragDropList
                    items={sequence().map(id => scriptItems[id]).filter(Boolean)}
                    renderItem={item => item?.renderCompact() ?? null}
                    onReorder={(newOrder) => {
                        const newSeq = newOrder.map(i => sequence()[i]);
                        reorderScriptItems(newSeq);
                    }}
                />
            </Show>
        </main>
    );
}
