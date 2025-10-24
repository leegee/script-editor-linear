import styles from "./TimelineLayout.module.scss";
import { useLocation } from "@solidjs/router";
import { onMount, type ParentProps } from "solid-js";
import TimelineView from "../components/views/TimelineView";
import NavBar from "../components/NavBar";

export default function TimelineLayout(props: ParentProps) {
    const location = useLocation();
    const hasDetail = () => /(^\/\w+)\/[^/]+\/[^/]+/.test(location.pathname);

    return (
        <div class={styles.layout}>
            <div class={styles.main}>
                <TimelineView />
            </div>

            <div id="TEST" class={styles.sidePanel} classList={{ [styles.visible]: hasDetail() }}>
                {props.children}
            </div>

            <div style="position: fixed; bottom: 0; display: flex; width: 100vw; justify-content: center">
                <NavBar />
            </div>
        </div>
    );
}
