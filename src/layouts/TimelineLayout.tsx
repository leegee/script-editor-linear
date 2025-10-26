import styles from "./TimelineLayout.module.scss";
import { createMemo, type ParentProps } from "solid-js";
import TimelineView from "../components/views/TimelineView";
import NavBar from "../components/NavBar";
import TimelineSidePanel from "../components/panels/TimelineSidePanel";


export default function TimelineLayout(props: ParentProps) {
    return (
        <div class={styles.layout}>
            <div class={styles.main}>
                <TimelineView />
            </div>

            <TimelineSidePanel>
                {props.children}
            </TimelineSidePanel>
        </div>
    );
}
