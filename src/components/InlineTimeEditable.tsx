import { createSignal, Show } from "solid-js";
import { timelineItems, setTimelineItems, reorderTimeline } from "../stores";
import styles from "./InlineEditor.module.scss";
import { formatHHMMSS } from "../lib/formatSecondsToHMS";

interface InlineTimeEditableProps {
    itemId: string;
}

// Convert HH:MM:SS to seconds
function parseHHMMSS(str: string) {
    const parts = str.split(":").map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 1) return parts[0];
    return 0;
}

export default function InlineTimeEditable(props: InlineTimeEditableProps) {
    const item = timelineItems[props.itemId];
    const [editing, setEditing] = createSignal(false);
    const [draft, setDraft] = createSignal(item?.startTime ? formatHHMMSS(item.startTime) : "00:00:00");

    if (!item) return null;

    const cancel = () => {
        setDraft(item.startTime ? formatHHMMSS(item.startTime) : "00:00:00");
        setEditing(false);
    };

    const commitChange = async () => {
        const newTime = parseHHMMSS(draft());
        if (isNaN(newTime)) return;

        // Update startTime in store
        setTimelineItems(props.itemId, "startTime", newTime);

        // Reorder timeline based on start times
        const newSeq = Object.values(timelineItems)
            .sort((a, b) => (a.startTime ?? 0) - (b.startTime ?? 0))
            .map(i => i.id);

        await reorderTimeline(newSeq);
        setEditing(false);
    };

    return (
        <Show
            when={!editing()}
            fallback={
                <input
                    class={styles.inlineEditor}
                    value={draft()}
                    onInput={e => setDraft(e.currentTarget.value)}
                    onBlur={commitChange}
                    onKeyDown={e => {
                        if (e.key === "Enter") commitChange();
                        else if (e.key === "Escape") cancel();
                    }}
                    autofocus
                />
            }
        >
            <div class={styles.inlineEditor} onDblClick={() => setEditing(true)}>
                {item.startTime !== undefined ? formatHHMMSS(item.startTime) : "00:00:00"}
            </div>
        </Show>
    );
}
