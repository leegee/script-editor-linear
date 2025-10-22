import { createEffect, onMount } from "solid-js";
import styles from "./AutoResizingTextarea.module.scss";

interface AutoResizingTextareaProps {
    label: string;
    value: string;
    onInput?: (value: string) => void;
    class?: string;
    placeholder?: string;
    maxHeight?: number;
    minHeight?: number;
    disabled?: boolean;
}

export default function AutoResizingTextarea(props: AutoResizingTextareaProps) {
    let textareaRef: HTMLTextAreaElement | undefined;

    const adjustHeight = () => {
        if (!textareaRef) return;
        textareaRef.style.height = "auto";
        const scrollHeight = textareaRef.scrollHeight;
        const maxH = props.maxHeight ?? 200;
        const minH = props.minHeight ?? 0;
        const finalHeight = Math.min(Math.max(scrollHeight, minH), maxH);
        textareaRef.style.height = `${finalHeight}px`;
        textareaRef.style.overflowY = scrollHeight > maxH ? "auto" : "hidden";
    };

    onMount(adjustHeight);

    createEffect(adjustHeight);

    return (
        <div class={props.class ?? ""}>
            <textarea
                ref={textareaRef}
                class={styles.textarea}
                placeholder={props.placeholder}
                value={props.value}
                disabled={props.disabled}
                onInput={(e) => {
                    props.onInput?.(e.currentTarget.value);
                    adjustHeight();
                }}
                style={{
                    "max-height": props.maxHeight ? `${props.maxHeight}px` : undefined,
                    "min-height": props.minHeight ? `${props.minHeight}px` : undefined,
                }}
            />

            <label>{props.label}</label>
        </div>
    );
}
