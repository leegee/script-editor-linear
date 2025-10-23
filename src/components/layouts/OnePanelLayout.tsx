import { ParentProps } from "solid-js";
import NavBar from "../NavBar";

export default function OnePanelLayout(props: ParentProps) {
    return (
        <>
            <div class="">
                {props.children}
            </div>
            <NavBar />
        </>
    );
}
