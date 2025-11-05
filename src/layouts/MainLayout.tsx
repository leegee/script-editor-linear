import { ParentProps } from "solid-js";
import { A } from "@solidjs/router";
import AlertConfirm from "../components/modals/AlertConfirm";
import { Menu } from "./Menu";

export default function MainLayout(props: ParentProps) {
    return (
        <>
            <AlertConfirm />

            <main style="height: 100vh" class="surface-container-lowest no-padding no-margin">
                <div class="tabs max surface-container-low bottom-margin small-margin">
                    <Menu />
                    <A title="Script view" class="transparent" href="/script"><i class="small">list_alt</i></A>
                    <A title="Timeline view" class="transparent" href="/timeline"><i class="small">view_timeline</i></A>
                    <A title="Typing view" class="transparent" href="/typing"><i class="small">keyboard</i></A>
                </div>

                <div>
                    <div class="page active surface-low">
                        {props.children}
                    </div>
                </div>
            </main>
        </>
    );
}

