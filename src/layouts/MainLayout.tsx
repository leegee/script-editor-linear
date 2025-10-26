import { createSignal, onMount, ParentProps, Show } from "solid-js";
import AlertConfirm from "../components/modals/AlertConfirm";
import { loadAll } from "../stores";
import { A } from "@solidjs/router";

export default function MainLayout(props: ParentProps) {
    return (
        <>
            <AlertConfirm />
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
        </>
    );
}
