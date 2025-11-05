// packages/client/src/components/TimelineEditor.tsx
import { onMount } from "solid-js";
import styles from "./TypingInput.module.scss";

import {
    timelineItems,
    timelineSequence,
    createTimelineItemAfter
} from "../stores/timelineItems";

import { characters } from "../stores/characters";

export default function TimelineEditor() {
    let editorDiv!: HTMLElement;

    onMount(() => renderInitial());

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
                const speaker = characters[item.details.ref]?.title.toLocaleUpperCase() ?? "UNKNOWN";
                div.innerText = speaker + "\n" + (item.details.text ?? "");
            } else {
                div.innerText = item.details.text ?? "";
            }

            frag.appendChild(div);
        }

        editorDiv.appendChild(frag);
    }

    // ---------- helpers ----------
    function getCurrentLineDiv(): HTMLElement | null {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return null;
        let node = sel.anchorNode as Node | null;
        if (!node) return null;

        while (node && node !== editorDiv && !(node instanceof HTMLElement && node.parentElement === editorDiv)) {
            node = node.parentElement;
        }

        if (node && node !== editorDiv && node instanceof HTMLElement && node.parentElement === editorDiv) {
            return node;
        }

        node = sel.anchorNode as Node | null;
        while (node && node !== editorDiv) {
            if (node instanceof HTMLElement && node.dataset && node.dataset.id !== undefined) return node;
            node = node.parentElement;
        }
        return null;
    }

    function getCaretLineIndex(div: HTMLElement): number {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return 0;

        const range = sel.getRangeAt(0);
        let line = 0;
        let reached = false;

        function walk(node: Node): boolean {
            if (node === range.endContainer) {
                reached = true;
                return true;
            }

            if (node.nodeType === Node.TEXT_NODE) {
                // Count \n in text node before caret
                const textNode = node as Text;
                if (!reached) {
                    let offset = (node === range.endContainer) ? range.endOffset : textNode.length;
                    const textBefore = textNode.data.slice(0, offset);
                    line += (textBefore.match(/\n/g) || []).length;
                }
            }

            if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === "BR") {
                line++;
            }

            for (let child of Array.from(node.childNodes)) {
                if (walk(child)) return true;
            }
            return false;
        }

        walk(div);
        return line;
    }


    function getCaretLineText(div: HTMLElement): { text: string; index: number } {
        const index = getCaretLineIndex(div);
        const lines = div.innerText.split("\n");
        return { text: lines[index] ?? "", index };
    }

    async function saveLine(div: HTMLElement) {
        const id = div.dataset.id;
        if (!id) return;
        const timelineItem = timelineItems[id];
        if (!timelineItem) return;

        await timelineItem.updateFromTyping(div.innerText);
    }

    function insertRenderedItemAfter(after: HTMLElement, id: string) {
        const item = timelineItems[id];
        const div = document.createElement("div");
        div.dataset.id = id;
        div.className = styles.timelineItem;
        div.contentEditable = "true";

        if (item.type === "dialogue") {
            const speaker = characters[item.details.ref]?.title.toLocaleUpperCase() ?? "";
            div.innerText = speaker + "\n" + (item.details.text ?? "");
        } else {
            div.innerText = item.details.text ?? "";
        }

        editorDiv.insertBefore(div, after.nextSibling);
        return div;
    }

    function focusDiv(div: HTMLElement) {
        const range = document.createRange();
        range.selectNodeContents(div);
        range.collapse(false);
        const sel = window.getSelection()!;
        sel.removeAllRanges();
        sel.addRange(range);
        div.focus();
    }

    // ---------- classification ----------
    function classifyLine(line: string) {
        const clean = line.trim();
        if (!clean) return null;

        // Structural markers (must be uppercase)
        if (/^(ACT|SCENE|BEAT)\b/.test(clean)) return { type: clean.split(/\s/)[0] };

        // Character check: locale-aware uppercase, match characters
        const upper = clean.toLocaleUpperCase();
        const found = Object.values(characters).find(c => c.title.toLocaleUpperCase() === upper);
        if (found) return { type: "dialogue", character: found.id };

        return null;
    }

    // ---------- process a completed line ----------
    async function processCompletedLine(div: HTMLElement, lineIndex: number) {
        const lines = div.innerText.split("\n");
        const lineText = lines[lineIndex].trim();
        if (!lineText) return;
        console.log("processCompletedLine", lineText)

        const classification = classifyLine(lineText);
        if (!classification) return;

        const id = div.dataset.id ?? "";
        await saveLine(div);

        // Split div at the completed line
        const before = lines.slice(0, lineIndex).join("\n");
        const after = lines.slice(lineIndex).join("\n");

        // Update current div with text before
        div.innerText = before;

        // Create new item starting from completed line
        const newId = await createTimelineItemAfter(id, classification.type, classification.type === "dialogue"
            ? { ref: classification.character!, text: after }
            : { text: after }
        );

        const newDiv = insertRenderedItemAfter(div, newId);
        focusDiv(newDiv);
    }

    // ---------- main key handler ----------
    async function handleKeyDown(e: KeyboardEvent) {
        const cur = getCurrentLineDiv();
        if (!cur) return;

        // Ctrl+S: save
        if (e.key === "s" && e.ctrlKey) {
            e.preventDefault();
            await saveLine(cur);
            return;
        }

        // Enter: insert line break
        if (e.key === "Enter") {
            e.preventDefault();
            const { index } = getCaretLineText(cur);
            document.execCommand("insertLineBreak");

            // After moving to next line, process the line just completed
            await processCompletedLine(cur, index);
        }
    }

    // ---------- blur handler ----------
    function handleBlur(e: FocusEvent) {
        const div = e.target as HTMLElement;
        if (!div || !div.dataset.id) return;

        const { index } = getCaretLineText(div);
        processCompletedLine(div, index);
    }

    // ---------- render ----------
    return (
        <article
            ref={el => (editorDiv = el!)}
            class={styles.typingEditor + " surface-container"}
            contentEditable={true}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
        />
    );
}
