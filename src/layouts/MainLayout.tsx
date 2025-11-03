import { ParentProps } from "solid-js";
import { A } from "@solidjs/router";
import AlertConfirm from "../components/modals/AlertConfirm";
import { Menu } from "./Menu";

export default function MainLayout(props: ParentProps) {
    return (
        <>
            <AlertConfirm />

            <main style="height: 100vh">
                <div class="tabs max">
                    <Menu />
                    <A title="Script view" class="transparent" href="/script"><i class="small">list_alt</i></A>
                    <A title="Timeline view" class="transparent" href="/timeline"><i class="small">view_timeline</i></A>
                    <A title="View settings" class="transparent" href="/settings"><i class="small">settings</i></A>
                </div>

                <div>
                    <div class="page active">
                        {props.children}
                    </div>
                </div>
            </main>
        </>
    );
}

