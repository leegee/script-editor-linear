import { ParentProps } from "solid-js";
import NavBar from "../components/NavBar";
import TimelineView from "../components/views/TimelineView";

export default function OnePanelLayout(props: ParentProps) {
    return (
        <>
            <TimelineView />

            {/* {props.children} */}

            <div style="position: fixed; bottom: 0; display: flex; width: 100vw; justify-content: center">
                <NavBar />
            </div>
        </>
    );
}
