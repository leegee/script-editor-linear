import { createSignal, createEffect, Show, onCleanup } from "solid-js";
import { characters, locations, timelineItems, updateCharacter, updateLocation, updateTimelineItem } from "../stores";
import AutoResizingTextarea from "./AutoResizingTextarea";
import { dictionary } from "cmu-pronouncing-dictionary";

interface TimelineItemEditorProps {
    id: string;                    // pass item.id, not full object
    path: "details" | "title" | "duration";
    key?: string;                  // nested key if path === "details"
    label?: string;
    defaultValue?: any;            // fallback value
    multiline?: boolean;           // textarea instead of input
    class?: string;                // CSS class
    editMode?: boolean;            // controlled edit mode
    store?: "timeline" | "locations" | "characters";
    onPhonemeCount?: (count: number) => void;
}

function countPhonemes(text: string): number {
    const words = text.toUpperCase().match(/[A-Z']+/g);
    if (!words) return 0;

    return words.reduce((total, word) => {
        const phonemes = dictionary[word];
        if (phonemes) return total + phonemes.length;
        // Weak heuristic fallback
        const syllables = (word.match(/[AEIOUY]+/g) || []).length || 1;
        return total + syllables * 3;
    }, 0);
}

function debounce<T extends (...args: any[]) => void>(fn: T, delay = 800) {
    let timeoutId: number | undefined;
    const debounced = (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => fn(...args), delay);
    };
    onCleanup(() => clearTimeout(timeoutId));
    return debounced;
}

export default function TimelineItemEditor(props: TimelineItemEditorProps) {
    const [editing, setEditing] = createSignal(props.editMode ?? false);
    const [value, setValue] = createSignal("");

    let inputRef: HTMLInputElement | undefined;

    const item = () =>
        props.store === "locations"
            ? locations[props.id]
            : props.store === "characters"
                ? characters[props.id]
                : timelineItems[props.id];

    // Initialise value on mount
    createEffect(() => {
        const i = item();
        if (!i) return;
        const v =
            props.path === "details" && props.key
                ? (i.details as Record<string, any>)?.[props.key]
                : (i as any)[props.path];
        setValue(v ?? props.defaultValue ?? "");
    });

    // Autofocus when editing becomes true
    createEffect(() => {
        if (editing() && !props.multiline && inputRef) {
            inputRef.focus();
            inputRef.selectionStart = inputRef.selectionEnd = inputRef.value.length;
        }
    });

    const debouncedPhonemeCheck = debounce((text: string) => {
        if (props.onPhonemeCount) {
            const count = countPhonemes(text);
            props.onPhonemeCount(count);
        }
    }, 800);

    createEffect(() => {
        debouncedPhonemeCheck(value());
    });

    const handleDblClick = () => setEditing(true);
    const handleInput = (v: string) => setValue(v);

    const handleBlur = () => {
        setEditing(false);
        const updateFn =
            props.store === "locations"
                ? updateLocation
                : props.store === "characters"
                    ? updateCharacter
                    : updateTimelineItem;
        updateFn(props.id, props.path, props.key ?? "", value());
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
