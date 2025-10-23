import { ParentProps } from "solid-js";
import NavBar from "../NavBar";

export default function OnePanelLayout(props: ParentProps) {
    return (
        <>

            {props.children}
            <div style="position: fixed; bottom: 0; display: flex; width: 100vw; justify-content: center">
                <NavBar />
            </div>
        </>
    );
}
