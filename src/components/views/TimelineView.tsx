import { For } from "solid-js";
import { timelineViewModel } from "../../stores/timelineViewModel";
import styles from "./TimelineView.module.scss";

const scale = 10;

export default function TimelineView() {
    const viewModel = () => timelineViewModel();

    return (
        <div class={styles.timeline}>
            <For each={Object.entries(viewModel().sections)}>
                {([sectionName, items]) => (
                    <div class={styles.section}>
                        <div class={styles.label}>{sectionName}</div>
                        <div class={styles.track}>
                            <For each={items}>
                                {(item: any) => (
                                    <div
                                        classList={{
                                            [styles.item]: true,
                                            [styles[`type-${item.type}`]]: !!item.type,
                                        }}
                                        style={{
                                            left: `${item.start * scale}px`,
                                            width: `${item.duration * scale}px`,
                                        }}
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
    );
}
