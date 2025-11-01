import styles from "./TimelineLayout.module.scss";
import { type ParentProps } from "solid-js";
import TimelineView from "../components/views/TimelineView";
import TimelineSidePanel from "../components/panels/TimelineSidePanel";
import Navbar from "../components/NavBar";


export default function TimelineLayout(props: ParentProps) {
    return (
        <div class={styles.layout}>
            <div class={styles.main}>
                <TimelineView />
            </div>

            <TimelineSidePanel>
                <>
                    <Navbar />
                    {props.children}
                </>
            </TimelineSidePanel>
        </div>
    );
}
