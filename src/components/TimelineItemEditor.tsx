import { createSignal, createEffect, Show } from "solid-js";
import { characters, locations, timelineItems, updateCharacter, updateLocation, updateTimelineItem } from "../stores";
import AutoResizingTextarea from "./AutoResizingTextarea";

interface TimelineItemEditorProps {
    item?: any;                    // Unsaved or existing object
    setItem?: (newItem: any) => void; // Optional setter for local object
    id?: string;
    path: "details" | "title" | "duration" | "notes";
    key?: string;
    label?: string;
    defaultValue?: any;
    multiline?: boolean;
    class?: string;
    editMode?: boolean;
    store?: "timeline" | "locations" | "characters" | "notes";
    onChange?: (newTextValue: string) => void;
}

export default function TimelineItemEditor(props: TimelineItemEditorProps) {
    const [editing, setEditing] = createSignal(props.editMode ?? false);
    const [value, setValue] = createSignal("");

    let inputRef: HTMLInputElement | undefined;

    const currentItem = () => props.item ?? (
        props.store === "locations"
            ? locations[props.id!]
            : props.store === "characters"
                ? characters[props.id!]
                : timelineItems[props.id!]
    );

    createEffect(() => {
        const i = currentItem();
        if (!i) return;
        const v =
            props.path === "details" && props.key
                ? (i.details as Record<string, any>)?.[props.key]
                : (i as any)[props.path];
        setValue(v ?? props.defaultValue ?? "");
    });

    createEffect(() => {
        if (editing() && !props.multiline && inputRef) {
            inputRef.focus();
            inputRef.selectionStart = inputRef.selectionEnd = inputRef.value.length;
        }
    });

    const handleDblClick = () => setEditing(true);
    const handleInput = (v: string) => setValue(v);

    const handleBlur = () => {
        setEditing(false);

        const v = value();

        if (props.id && props.store) {
            const updateFn =
                props.store === "locations"
                    ? updateLocation
                    : props.store === "characters"
                        ? updateCharacter
                        : updateTimelineItem;
            updateFn(props.id, props.path, props.key ?? "", v);
        }

        else if (props.item) {
            // Update local object via setter if provided
            if (props.setItem) {
                props.setItem((prev: any) => { // ugh
                    const copy = { ...prev };
                    if (props.path === "details" && props.key) {
                        copy.details ??= {};
                        copy.details[props.key] = v;
                    } else {
                        copy[props.path] = v;
                    }
                    return copy;
                });
            } else {
                if (props.path === "details" && props.key) {
                    props.item.details ??= {};
                    props.item.details[props.key] = v;
                } else {
                    props.item[props.path] = v;
                }
            }
        }

        if (props.onChange) props.onChange(v);
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
