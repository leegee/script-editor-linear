import { onMount, createSignal, Show, createEffect, Switch, Match, JSX, ParentProps } from "solid-js";
import { useNavigate } from "@solidjs/router";
import DragDropList from "./components/DragDropList";
// import TimelineView from "./components/TimelineView";
import { loadAll } from "./stores";
import { timelineItems, timelineSequence, reorderTimeline } from "./stores/timelineItems";
import { ingest } from "./lib/ingest";
import { ViewModeSwitch } from "./components/ViewModeSwitch";
// import { layoutTimeline } from "./lib/timelineLayout";
import { sampleScript, sampleCharacters, sampleLocations } from "./scripts/TheThreeBears";
import { storage } from "./db";
import { TimelineItem } from "./components/CoreItems";

export default function App(props: ParentProps) {
    const navigate = useNavigate();
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
                                    showItem={(item) => navigate(`/item/${item.id}`)}
                                    onInsert={(pos: number) => navigate(`/new/${pos}`)}
                                    onReorder={(newOrder) => {
                                        const seq = timelineSequence();
                                        const newSeq = newOrder.map(i => seq[i]);
                                        reorderTimeline(newSeq);
                                    }}
                                />
                            </Show>

                            <Show when={viewMode() === "timeline"}>
                                {/* <TimelineView
                                    items={items()}
                                    layout={layoutTimeline(items(), { totalWidth: 1200, laneHeight: 80 })}
                                /> */}
                                <p>WIP</p>
                            </Show>
                        </div>

                        <div class="s12 m6 l6">
                            {/* <!-- right panel --> */}
                            {props.children}
                        </div>
                    </div>

                </Show>
            </main >

            <nav class="bottom">
                <ViewModeSwitch onChange={setViewMode} />
            </nav>

        </>
    );
}
