import { onMount, createSignal, Show } from "solid-js";
import DragDropList from "./components/DragDropList";
import { scriptItems, sequence, loadAll, reorderScriptItems } from "./stores/coreStores";
import { ingest } from "./scripts/TheThreeBears";
import { ViewModeSwitch } from "./components/ViewModeSwitch";
import { layoutTimeline } from "./lib/timelineLayout";

export default function App() {
    const [loaded, setLoaded] = createSignal(false);
    const [viewMode, setViewMode] = createSignal<"list" | "timeline">("list");

    const layouted = layoutTimeline(sequence().map(id => scriptItems[id]).filter(Boolean), {
        totalWidth: 1200,
        laneHeight: 40,
    });

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
                    getItemX={(item) => layouted.find(l => l.item.id === item.id)!.x}
                    getItemY={(item) => layouted.find(l => l.item.id === item.id)!.y}
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
