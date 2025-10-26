import { createSignal, onMount, ParentProps, Show } from "solid-js";
import AlertConfirm from "../components/modals/AlertConfirm";
import { loadAll } from "../stores";
import { A } from "@solidjs/router";

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
                <div>
                    <div class="tabs">
                        <A class="transparent" href="/script"><i class="small">list_alt</i></A>
                        <A class="transparent" href="/timeline"><i class="small">view_timeline</i></A>
                        <A class="transparent" href="/script/settings"><i class="small">settings</i></A>
                    </div>

                    <div>
                        <div class="page active">
                            {props.children}
                        </div>
                    </div>
                </div>
            </Show>
        </>
    );
}
