import styles from "./TimelineLayout.module.scss";
import { type ParentProps } from "solid-js";
import TimelineView from "../components/views/TimelineView";
import TimelineSidePanel from "../components/panels/TimelineSidePanel";


export default function TimelineLayout(props: ParentProps) {
    return (
        <div class={styles.layout}>
            <div class={styles.main + ' surface-container-low'}>
                <TimelineView />
            </div>

            <TimelineSidePanel>
                {props.children}
            </TimelineSidePanel>
        </div>
    );
}
