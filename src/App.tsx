import { onMount, createSignal, Show } from "solid-js";
import DragDropList from "./components/DragDropList";
import { scriptItems, sequence, loadAll, reorderScriptItems } from "./stores/coreStores";
import { ingest } from "./scripts/TheThreeBears";
import { ViewModeSwitch } from "./components/ViewModeSwitch";

export default function App() {
    const [loaded, setLoaded] = createSignal(false);
    const [viewMode, setViewMode] = createSignal<"list" | "timeline">("list");

    onMount(async () => {
        await ingest();
        await loadAll();
        setLoaded(true);
    });

    return (
        <main class="responsive">
            <Show when={loaded()} fallback={<p>Loading script...</p>}>

                <ViewModeSwitch onChange={setViewMode} />

                <DragDropList
                    items={sequence().map(id => scriptItems[id]).filter(Boolean)}
                    renderItem={item => item?.renderCompact() ?? null}
                    viewMode={viewMode()}
                    onReorder={(newOrder) => {
                        const newSeq = newOrder.map(i => sequence()[i]);
                        reorderScriptItems(newSeq);
                    }}
                />
            </Show>
        </main>
    );
}
