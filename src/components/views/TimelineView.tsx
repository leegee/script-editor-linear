import { onCleanup, onMount, createSignal } from "solid-js";
import styles from "./TimelineView.module.scss";
import { For, Show } from "solid-js";
import { timelineViewModel } from "../../stores/timelineViewModel";

const type2icon: Record<string, string> = {
    dialogue: "3p",
    action: "electric_bolt",
    transition: "transition_fade",
    sound: "brand_awareness",
    camera: "camera",
    lighting: "brightness_6",
    pause: "pause",
    beat: "music_note",
};

export default function TimelineView() {
    const viewModel = () => timelineViewModel();

    const [scale, setScale] = createSignal(10); // ← make it reactive
    let timelineEl: HTMLDivElement | undefined;

    onMount(() => {
        if (!timelineEl) return;

        const wheelHandler = (e: WheelEvent) => {
            if (!timelineEl) return;

            if (e.ctrlKey) {
                e.preventDefault();

                const rect = timelineEl.getBoundingClientRect();
                const mouseX = e.clientX - rect.left + timelineEl.scrollLeft; // mouse position in content coords
                const prevScale = scale();
                const nextScale = Math.min(Math.max(prevScale * (e.deltaY > 0 ? 0.9 : 1.1), 2), 200);

                // compute new scroll offset so the zoom point stays fixed
                const scaleRatio = nextScale / prevScale;
                const newScrollLeft = mouseX * scaleRatio - (e.clientX - rect.left);

                setScale(nextScale);
                // After setScale takes effect
                queueMicrotask(() => {
                    timelineEl.scrollLeft = newScrollLeft;
                });
            } else {
                e.preventDefault();
                timelineEl.scrollLeft += e.deltaY;
            }
        };

        timelineEl.addEventListener("wheel", wheelHandler, { passive: false });
        onCleanup(() => timelineEl?.removeEventListener("wheel", wheelHandler));
    });

    return (
        <div ref={timelineEl} class={styles.timeline}>
            <For each={Object.entries(viewModel().sections)}>
                {([sectionName, items]) => {
                    const types = Array.from(new Set(items.map((i) => i.type)));

                    return (
                        <article class={styles.section}>
                            <div class={styles.label}>{sectionName}</div>
                            <div
                                class={styles.track}
                                style={{
                                    width: `${viewModel().totalDuration * scale()}px`,
                                }}
                            >
                                <For each={types}>
                                    {(type) => (
                                        <div class={styles["type-row"]}>
                                            <For each={items.filter((i) => i.type === type)}>
                                                {(item) => (
                                                    <div
                                                        class={styles.item}
                                                        classList={{
                                                            [styles[`type-${item.type}`]]: true,
                                                        }}
                                                        style={{
                                                            left: `${item.details.start * scale()}px`,
                                                            width: `${item.duration != null ? item.duration * scale() : 2
                                                                }px`,
                                                        }}
                                                        title={
                                                            item.title ||
                                                            (item.type === "dialogue"
                                                                ? item.details.text
                                                                : item.type)
                                                        }
                                                    >
                                                        <Show
                                                            when={type2icon[item.type]}
                                                            fallback={<span>{item.title ?? item.type}</span>}
                                                        >
                                                            <i class="tiny">{type2icon[item.type]}</i>
                                                        </Show>
                                                    </div>
                                                )}
                                            </For>
                                        </div>
                                    )}
                                </For>
                            </div>
                        </article>
                    );
                }}
            </For>
        </div>
    );
}
