import { onMount, createSignal, Show } from "solid-js";
import DragDropList from "./components/DragDropList";
import TimelineView from "./components/TimelineView";
import { loadAll } from "./stores";
import { timelineItems, timelineSequence, reorderTimeline } from "./stores/timelineItems";
import { ingest } from "./lib/ingest";
import { ViewModeSwitch } from "./components/ViewModeSwitch";
import { layoutTimeline } from "./lib/timelineLayout";
import { sampleScript, sampleCharacters, sampleLocations } from "./scripts/TheThreeBears";
import { storage } from "./db";

export default function App() {
    const [loaded, setLoaded] = createSignal(false);
    const [viewMode, setViewMode] = createSignal<"list" | "timeline">("list");

    onMount(async () => {
        if ((await storage.getKeys("timelineItems")).length === 0) {
            await ingest(sampleScript, sampleCharacters, sampleLocations);
        }

        await loadAll();
        setLoaded(true);
    });

    const items = () => timelineSequence().map(id => timelineItems[id]).filter(Boolean);

    return (
        <>
            <main class="responsive">
                <Show when={loaded()} fallback={<p>Loading script...</p>}>

                    <Show when={viewMode() === "list"}>
                        <DragDropList
                            items={items()}
                            renderItem={(item) => item?.renderCompact() ?? null}
                            onReorder={(newOrder) => {
                                const newSeq = newOrder.map((i) => timelineSequence()[i]);
                                reorderTimeline(newSeq);
                            }}
                        />
                    </Show>

                    <Show when={viewMode() === "timeline"}>
                        <TimelineView
                            items={items()}
                            layout={layoutTimeline(items(), { totalWidth: 1200, laneHeight: 80 })}
                        />
                    </Show>
                </Show>
            </main>

            <nav class="bottom">
                <ViewModeSwitch onChange={setViewMode} />
            </nav>

        </>
    );
}
