import styles from "./TimelineSidePanel.module.scss";
import { createSignal, onMount, onCleanup, type ParentProps, Match, Switch } from "solid-js";

export default function TimelineSidePanel(props: ParentProps) {
    const [open, setOpen] = createSignal(false);
    let containerRef: HTMLDivElement | undefined;

    // Click outside to auto-hide
    const handleClickOutside = (e: MouseEvent) => {
        if (!containerRef) return;
        if (!containerRef.contains(e.target as Node)) {
            setOpen(false);
        }
    };

    onMount(() => {
        document.addEventListener("mousedown", handleClickOutside);
    });

    onCleanup(() => {
        document.removeEventListener("mousedown", handleClickOutside);
    });

    return (
        <article ref={containerRef} class={styles.container} classList={{ [styles.open]: open() }}>
            <div class={styles.tab} onClick={() => setOpen(!open())}>
                <Switch fallback={<i>chevron_backward</i>}>
                    <Match when={open()}>
                        <i>chevron_forward</i>
                    </Match>
                </Switch>

            </div>

            <div class={styles.content}>{props.children}</div>
        </article>
    );
}
