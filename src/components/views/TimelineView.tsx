import styles from "./TimelineView.module.scss";
import { For, Show } from "solid-js";
import { timelineViewModel } from "../../stores/timelineViewModel";

const scale = 10;

const type2icon: Record<string, string> = {
    dialogue: '3p',
    action: 'electric_bolt',
    transition: 'transition_fade',
    sound: 'brand_awareness',
    camera: 'camera',
    lighting: 'brightness_6',
    pause: 'pause',
    beat: 'cadence'
}

export default function TimelineView() {
    const viewModel = () => timelineViewModel();

    return (
        <div class={styles.timeline}>
            <For each={Object.entries(viewModel().sections)}>
                {([sectionName, items]) => {
                    // Determine all types in this section
                    const types = Array.from(new Set(items.map((i) => i.type)));

                    return (
                        <article class={styles.section}>
                            <div class={styles.label}>{sectionName}</div>
                            <div class={styles.track} style={{
                                width: `${viewModel().totalDuration * scale}px`,
                            }}>
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
                                                            left: `${item.details.start * scale}px`,
                                                            width: `${item.duration != null ? item.duration * scale : 2}px`,
                                                        }}
                                                        title={item.title || (item.type === "dialogue" ? item.details.text : item.type)}
                                                    >
                                                        <Show when={type2icon[item.type]}
                                                            fallback={<span> {item.title ?? item.type} </span>}>
                                                            <i>{type2icon[item.type]}</i>
                                                        </Show>
                                                        <div class="tooltip">Test</div>
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
