import { createSignal, createEffect, Show } from "solid-js";
import { timelineItems, updateTimelineItem } from "../stores";
import AutoResizingTextarea from "./AutoRessizingTextarea";

interface TimelineItemEditorProps {
    id: string;                    // pass item.id, not full object
    path: "details" | "title" | "duration";
    key?: string;                  // nested key if path === "details"
    label?: string;
    defaultValue?: any;            // fallback value
    multiline?: boolean;           // textarea instead of input
    class?: string;                // CSS class
    editMode?: boolean;            // controlled edit mode
}

export default function TimelineItemEditor(props: TimelineItemEditorProps) {
    const [editing, setEditing] = createSignal(props.editMode ?? false);
    const [value, setValue] = createSignal("");

    let inputRef: HTMLInputElement | undefined;

    const item = () => timelineItems[props.id];

    // Initialise value on mount
    createEffect(() => {
        const i = item();
        if (!i) return;

        let v: any;
        if (props.path === "details" && props.key) {
            v = i.details?.[props.key];
        } else {
            v = (i as any)[props.path];
        }
        setValue(v ?? props.defaultValue ?? "");
    });

    // Autofocus when editing becomes true
    createEffect(() => {
        if (editing()) {
            if (!props.multiline && inputRef) {
                inputRef.focus();
                inputRef.selectionStart = inputRef.selectionEnd = inputRef.value.length;
            }
        }
    });

    const handleDblClick = () => setEditing(true);
    const handleInput = (v: string) => setValue(v);
    const handleBlur = () => {
        setEditing(false);
        updateTimelineItem(props.id, props.path, props.key ?? "", value());
    };

    return (
        <Show
            when={editing()}
            fallback={
                <div class={props.class} onDblClick={handleDblClick}>
                    {value() || <span class="placeholder">(empty)</span>}
                </div>
            }
        >
            {props.multiline ? (
                // <textarea
                //     ref={(el) => (textareaRef = el)}
                //     class={props.class}
                //     value={value()}
                //     onInput={(e) => handleInput(e.currentTarget.value)}
                //     onBlur={handleBlur}
                //     autofocus
                // />
                <AutoResizingTextarea
                    class={props.class}
                    value={value()}
                    onInput={handleInput}
                    onBlur={handleBlur}
                    maxHeight={300}
                    minHeight={50}
                    disabled={false}
                    autofocus={editing()}
                    label={props.label}
                />
            ) : (
                <input
                    ref={(el) => (inputRef = el)}
                    type="text"
                    class={props.class}
                    value={value()}
                    onInput={(e) => handleInput(e.currentTarget.value)}
                    onBlur={handleBlur}
                    autofocus
                />
            )}
        </Show>
    );
}
