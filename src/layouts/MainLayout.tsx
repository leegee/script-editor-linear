import { createSignal, onMount, ParentProps, Show } from "solid-js";
import AlertConfirm from "../components/modals/AlertConfirm";
import { loadAll } from "../stores";

export default function MainLayout(props: ParentProps) {
    const [loaded, setLoaded] = createSignal(false);

    onMount(async () => {
        if (!loaded()) {
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
