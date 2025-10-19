import { onMount, createSignal, Show, createEffect } from "solid-js";
import DragDropList from "./components/DragDropList";
import TimelineView from "./components/TimelineView";
import { loadAll } from "./stores";
import { timelineItems, timelineSequence, reorderTimeline } from "./stores/timelineItems";
import { ingest } from "./lib/ingest";
import { ViewModeSwitch } from "./components/ViewModeSwitch";
import { layoutTimeline } from "./lib/timelineLayout";
import { sampleScript, sampleCharacters, sampleLocations } from "./scripts/TheThreeBears";
import { storage } from "./db";
import NewTimelineItemSelector from "./components/NewTimelineItemSelector";
import { TimelineItem } from "./components/CoreItems";

export default function App() {
    const [insertNewItemPos, setInsertNewItemPos] = createSignal(-1);
    const [itemToShow, setItemToShow] = createSignal<TimelineItem | null>(null);
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

                    <div class="grid">
                        <div class="s12 m6 l6 ">

                            <Show when={viewMode() === "list"}>
                                <DragDropList
                                    items={items()}
                                    renderItem={(item) => {
                                        return (<span style="width:100%" onClick={() => setItemToShow(item)}>
                                            {item?.renderCompact() ?? null}
                                        </span>)
                                    }}
                                    onInsert={(pos: number) => setInsertNewItemPos(pos)}
                                    onReorder={(newOrder) => {
                                        const seq = timelineSequence();
                                        const newSeq = newOrder.map(i => seq[i]);
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
                        </div>

                        <div class="s12 m6 l6">
                            {/* <!-- right panel --> */}
                            <Show when={insertNewItemPos() > -1}>
                                <NewTimelineItemSelector
                                    insertAtIndex={insertNewItemPos()}
                                    onCancel={() => setInsertNewItemPos(-1)}
                                    onCreated={() => setInsertNewItemPos(-1)}
                                />
                            </Show>

                            <Show when={insertNewItemPos() === -1 && itemToShow() !== null}>
                                {itemToShow()!.renderFull()}
                            </Show>
                        </div>
                    </div>

                </Show>
            </main>

            <nav class="bottom">
                <ViewModeSwitch onChange={setViewMode} />
            </nav>

        </>
    );
}
