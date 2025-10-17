import { createSignal, Show } from "solid-js";
import { setTimelineItems } from "../stores";
import styles from "./InlineTimeEditor.module.scss";

// Utility: format seconds as HH:MM:SS
export const formatHHMMSS = (secs: number) =>
    [Math.floor(secs / 3600), Math.floor((secs % 3600) / 60), Math.floor(secs % 60)]
        .map((n) => n.toString().padStart(2, "0"))
        .join(":");

// Utility: parse HH:MM:SS or MM:SS to seconds
export const parseHHMMSS = (str: string): number | null => {
    const parts = str.split(":").map(Number);
    if (parts.some(isNaN)) return null;
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 1) return parts[0];
    return null;
};

interface InlineTimeEditableProps {
    itemId: string;
    startTime: number;
    class?: string;
}

export default function InlineTimeEditable(props: InlineTimeEditableProps) {
    const [editing, setEditing] = createSignal(false);
    const [draft, setDraft] = createSignal(formatHHMMSS(props.startTime));

    const cancel = () => {
        setDraft(formatHHMMSS(props.startTime));
        setEditing(false);
    };

    return (
        <Show
            when={!editing()}
            fallback={
                <input
                    class={styles.inlineEditor + " " + (props.class ?? "")}
                    value={draft()}
                    onInput={(e) => setDraft(e.currentTarget.value)}
                    onBlur={() => {
                        const seconds = parseHHMMSS(draft());
                        if (seconds != null) setTimelineItems(props.itemId, "startTime", seconds);
                        setEditing(false);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            const seconds = parseHHMMSS(draft());
                            if (seconds != null) setTimelineItems(props.itemId, "startTime", seconds);
                            setEditing(false);
                        } else if (e.key === "Escape") {
                            cancel();
                        }
                    }}
                    autofocus
                />
            }
        >
            <div class={props.class} onDblClick={() => setEditing(true)}>
                {formatHHMMSS(props.startTime)}
            </div>
        </Show>
    );
}
