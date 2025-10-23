import styles from "./TimelineView.module.scss";
import { For } from "solid-js";
import { timelineViewModel } from "../../stores/timelineViewModel";
import { orderedItems } from "../../stores";

const scale = 10;

export default function TimelineView() {
    const viewModel = () => timelineViewModel();

    return (
        <>
            <pre>
                {JSON.stringify(orderedItems(), null, 4)}
            </pre>
            <div class={styles.timeline}>
                <For each={Object.entries(viewModel().sections)}>
                    {([sectionName, items]) => (
                        <div class={styles.section}>
                            <div class={styles.label}>{sectionName}</div>
                            <div class={styles.track}>
                                <For each={items}>
                                    {(item) => (
                                        <div
                                            class="elevalte"
                                            classList={{
                                                [styles.item]: true,
                                                [styles[`type-${item.type}`]]: !!item.type,
                                            }}
                                            style={{
                                                left: `${item.details.start * scale}px`,
                                                width: `${item.duration != null ? item.duration * scale : 2}px`,
                                            }}
                                            title={item.title || (item.type === "dialogue" ? item.details.text : item.type)}
                                        >
                                            {item.title ?? item.type}
                                        </div>
                                    )}
                                </For>
                            </div>
                        </div>
                    )}
                </For>
            </div>
        </>
    );
}
