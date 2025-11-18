import styles from "./TimelineSidePanel.module.scss";
import { createSignal, onMount, onCleanup, type ParentProps, Match, Switch, createEffect } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";
import { useChildRoute } from "../../contexts/ChildRoute";


export default function TimelineSidePanel(props: ParentProps) {
    const { isChildRoute, routeWithoutChild } = useChildRoute();
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = createSignal(false);
    let containerRef: HTMLDivElement | undefined;

    // Click outside to auto-hide
    const handleClickOutside = (e: MouseEvent) => {
        if (!containerRef) return;
        if (!containerRef.contains(e.target as Node)) {
            setOpen(false);
        }
    };

    onMount(() => document.addEventListener("mousedown", handleClickOutside));

    onCleanup(() => document.removeEventListener("mousedown", handleClickOutside));

    createEffect(() =>
        setOpen(/(^\/\w+)?\/+[^/]+[^/]+$/.test(
            location.pathname.slice(1)
        ))
    );

    createEffect(() => {
        if (isChildRoute()) {
            navigate(routeWithoutChild());
        }
    });

    return (
        <article ref={containerRef}
            classList={{
                "large-elevate": true,
                "surface-container-high": true,
                [styles.open]: open(),
                [styles.container]: true,
            }}
        >
            <div class={styles.tab} onClick={() => setOpen(!open())}>
                <Switch fallback={<i>chevron_backward</i>}>
                    <Match when={open()}>
                        <i>chevron_forward</i>
                    </Match>
                </Switch>

            </div>

            <div class={styles.content + ' right-padding'}>
                {props.children}
            </div>
        </article>
    );
}
