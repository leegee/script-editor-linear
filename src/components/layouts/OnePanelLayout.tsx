import { ParentProps } from "solid-js";
import NavBar from "../NavBar";

export default function OnePanelLayout(props: ParentProps) {
    return (
        <>
            <main class="app responsive">
                {props.children}
            </main>
            <NavBar />
        </>
    );
}
