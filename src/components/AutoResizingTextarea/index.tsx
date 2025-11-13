import { createEffect, onMount } from "solid-js";
import styles from "./AutoResizingTextarea.module.scss";

interface AutoResizingTextareaProps {
    value: string;
    label?: string;
    onInput?: (value: string) => void;
    onBlur?: (value: string) => void;
    class?: string;
    placeholder?: string;
    maxHeight?: number;
    minHeight?: number;
    disabled?: boolean;
    autofocus?: boolean;
}

export default function AutoResizingTextarea(props: AutoResizingTextareaProps) {
    let textareaRef: HTMLTextAreaElement | undefined;

    const adjustHeight = () => {
        if (!textareaRef) return;

        // Reset height to let scrollHeight grow naturally
        textareaRef.style.height = "auto";

        const scrollHeight = textareaRef.scrollHeight;
        const maxH = props.maxHeight ?? 200;
        const minH = props.minHeight ?? 48;
        const finalHeight = Math.min(Math.max(scrollHeight + 10, minH), maxH);

        // Set textarea height
        textareaRef.style.height = `${finalHeight}px`;
        textareaRef.style.overflowY = scrollHeight > maxH ? "auto" : "hidden";
    };

    // Initial mount
    onMount(() => {
        if (!textareaRef) return;
        textareaRef.value = props.value;
        adjustHeight();
    });

    // Update when props.value changes
    createEffect(() => {
        if (!textareaRef) return;
        textareaRef.value = props.value;
        adjustHeight();
    });

    return (
        <>
            <textarea
                ref={(el) => (textareaRef = el)}
                class={styles.textarea}
                placeholder={props.placeholder}
                disabled={props.disabled}
                onBlur={(e) => props.onBlur?.(e.currentTarget.value)}
                onInput={(e) => {
                    props.onInput?.(e.currentTarget.value);
                    adjustHeight();
                }}
                style={{
                    "block-size": "auto",
                    "min-block-size": props.minHeight ? `${props.minHeight}px` : "24px",
                    "max-block-size": props.maxHeight ? `${props.maxHeight}px` : "200px",
                    "overflow-y": textareaRef && textareaRef.scrollHeight > (props.maxHeight ?? 200) ? "auto" : "hidden",
                    "resize": "none",
                }}
            />

            {props.label && <label>{props.label}</label>}
        </>
    );
}
