import { createSignal, onMount, ParentProps, Show } from "solid-js";
import AlertConfirm from "./components/modals/AlertConfirm";
import { storage } from "./db";
import { loadSampleScript } from "./lib/io";
import { loadAll, orderedItems } from "./stores";

export default function App(props: ParentProps) {
    const [loaded, setLoaded] = createSignal(false);

    onMount(async () => {
        if (!loaded()) {
            const keys = await storage.getKeys("timelineItems");
            if (!keys?.length) await loadSampleScript();
            await loadAll();
            setLoaded(true);
        }
    });

    return (
        <>
            <AlertConfirm />

            <Show when={loaded} fallback={<p>Loading script</p>}>
                {props.children}
            </Show>
        </>
    );
}
