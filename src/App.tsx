import { onMount, createSignal, Show, ParentProps } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import DragDropList from "./components/DragDropList";
import { loadAll } from "./stores";
import { timelineItems, timelineSequence, reorderTimeline } from "./stores/timelineItems";
import { ingest } from "./lib/ingest";
import { ViewModeSwitch } from "./components/ViewModeSwitch";
import { sampleScript, sampleCharacters, sampleLocations } from "./scripts/TheThreeBears";
import { storage } from "./db";

export default function App(props: ParentProps) {
    const navigate = useNavigate();
    const [loaded, setLoaded] = createSignal(false);

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

                    <div class="grid" style="height: calc(100vh - 7em); overflow: hidden ">
                        <div class="s12 m8 l8" style='height: auto; overflow-y: auto'>

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
                        </div>

                        <div class="s12 m4 l4">
                            {/* <!-- right panel --> */}
                            {props.children}
                        </div>
                    </div>

                </Show>
            </main >

            <nav class="bottom" style="height: 5em">
                <A href="/"><i>home</i></A>
            </nav>

        </>
    );
}
