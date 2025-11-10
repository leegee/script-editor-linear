import { ParentProps } from "solid-js";
import { A } from "@solidjs/router";
import AlertConfirm from "../components/modals/AlertConfirm";
import { Menu } from "./Menu";

export default function MainLayout(props: ParentProps) {
    return (
        <>
            <AlertConfirm />

            <main style="height: 100vh" class="background no-padding no-margin">
                <div class="tabs max background bottom-margin small-margin">
                    <Menu />
                    <A title="Script view" class="transparent" href="/script">
                        <i class="small">list_alt</i>
                        <div class="tooltip bottom">List View</div>
                    </A>
                    <A title="Timeline view" class="transparent" href="/timeline">
                        <i class="small">view_timeline</i>
                        <div class="tooltip bottom">Timeline View</div>
                    </A>
                    <A title="Typing view" class="transparent" href="/typing">
                        <i class="small">keyboard</i>
                        <div class="tooltip bottom">Typing View</div>
                    </A>
                </div>

                <div>
                    <div class="page active background">
                        {props.children}
                    </div>
                </div>
            </main>
        </>
    );
}

