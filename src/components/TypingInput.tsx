import { onMount } from "solid-js";
import styles from "./TypingInput.module.scss";

import {
    timelineItems,
    timelineSequence,
    updateTimelineItem
} from "../stores/timelineItems";

import { characters } from "../stores/characters";

export default function TimelineEditor() {
    let editorDiv!: HTMLElement;

    onMount(() => {
        renderInitial();
    });

    function renderInitial() {
        editorDiv.innerHTML = "";

        const frag = document.createDocumentFragment();

        for (const id of timelineSequence()) {
            const item = timelineItems[id];
            if (!item) continue;

            const div = document.createElement("div");
            div.dataset.id = id;
            div.className = styles.timelineItem;
            div.contentEditable = "true";

            if (item.type === "dialogue") {
                const speaker =
                    characters[item.details.ref]?.title.toUpperCase() ?? "UNKNOWN";
                const text = item.details.text ?? "";
                div.innerText = speaker + "\n" + text;
            } else {
                div.innerText = item.details.text ?? "";
            }

            frag.appendChild(div);
        }

        editorDiv.appendChild(frag);
    }

    async function saveLine(div: HTMLElement) {
        const id = div.dataset.id;
        if (!id) return;

        const timelineItem = timelineItems[id];
        if (!timelineItem) return;

        const newRawText = div.innerText;

        timelineItem.updateFromTyping(newRawText);
    }

    function handleKeyDown(e: KeyboardEvent) {
        console.log(e.key)
        if (e.key === "Enter") {
            e.preventDefault(); // prevent browser from inserting <div><br></div>

            // Get the currently focused line
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) {
                console.debug('no selection');
                return;
            }

            let node: HTMLElement | null = sel.anchorNode as HTMLElement;

            while (node && node !== editorDiv && node.dataset?.id === undefined) {
                node = node.parentElement;
            }

            if (node?.dataset?.id) {
                saveLine(node);
            }

            // Insert a new editable div after it
            insertNewLine(node!);
        }
    }

    function insertNewLine(after: HTMLElement) {
        const div = document.createElement("div");
        div.className = styles.timelineItem;
        div.contentEditable = "true";
        div.innerText = " ";
        editorDiv.insertBefore(div, after.nextSibling);

        // Move caret to new line
        const range = document.createRange();
        range.selectNodeContents(div);
        range.collapse(true);
        const sel = window.getSelection()!;
        sel.removeAllRanges();
        sel.addRange(range);
    }

    async function handleBlur(e: FocusEvent) {
        // If still inside the editor, do nothing
        //     const related = e.relatedTarget as Node | null;
        //     if (related && editorDiv.contains(related)) return;

        //     const tasks: Promise<any>[] = [];
        //     for (const child of Array.from(editorDiv.children)) {
        //         tasks.push(saveLine(child as HTMLElement));
        //     }
        //     await Promise.all(tasks);
    }

    return (
        <article
            ref={el => (editorDiv = el)}
            class={styles.typingEditor + ' border'}
            contentEditable={true}
            onKeyDown={handleKeyDown}
        // onFocusOut={handleBlur}
        />
    );
}
