import { createSignal, Show } from "solid-js";
import styles from "./InlineEditor.module.scss";

export default function InlineEditable(props: {
    value: string,
    onUpdate: (v: string) => void,
    class?: string,
    multiline?: boolean
}) {
    const [editing, setEditing] = createSignal(false);
    const [draft, setDraft] = createSignal(props.value);

    const cancel = () => {
        setDraft(props.value);  // revert to original
        setEditing(false);
    };

    return (
        <Show when={!editing()} fallback={
            props.multiline ?
                <textarea
                    class={props.class}
                    value={draft()}
                    onInput={e => setDraft(e.currentTarget.value)}
                    onBlur={() => { setEditing(false); props.onUpdate(draft()); }}
                    onKeyDown={e => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            setEditing(false);
                            props.onUpdate(draft());
                        } else if (e.key === "Escape") {
                            cancel();
                        }
                    }}
                    autofocus
                /> :
                <input
                    class={styles.inlineEditor + ' ' + props.class}
                    value={draft()}
                    onInput={e => setDraft(e.currentTarget.value)}
                    onBlur={() => { setEditing(false); props.onUpdate(draft()); }}
                    onKeyDown={e => {
                        if (e.key === "Enter") {
                            setEditing(false);
                            props.onUpdate(draft());
                        } else if (e.key === "Escape") {
                            cancel();
                        }
                    }}
                    autofocus
                />
        }>
            <div class={props.class} onDblClick={() => setEditing(true)}>{props.value || "—"}</div>
        </Show>
    );
}
