import styles from './TypingInput.module.scss';
import { onMount, onCleanup, createSignal } from "solid-js";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { basicSetup } from "codemirror";
import { timelineItems, timelineSequence } from "../stores";
import { DialogueItem } from "./CoreItems";

export default function TypingEditor() {
    let editorParent!: HTMLDivElement;
    let view: EditorView | null = null;
    const [currentBlock, setCurrentBlock] = createSignal<number>(0);

    function timelineToText() {
        return timelineSequence()
            .map(id => {
                const item = timelineItems[id];
                if (!item) return "";

                const title = item.title || "";
                const body = item.details?.text || "";
                const type = item.type.toUpperCase();

                if (type === "DIALOGUE") {
                    const ch = (item as DialogueItem).characterName.toUpperCase();
                    return ch + (body ? "\n" + body : "");
                }

                let rv = type + (title ? " " + title : "");
                if (body) rv += "\n" + body;
                return rv;
            })
            .join("\n\n");
    }

    function splitBlocks(text: string) {
        return text.split(/\n{2,}/g);
    }

    function blockIndexAtPos(text: string, pos: number) {
        let running = 0;
        const blocks = splitBlocks(text);
        for (let i = 0; i < blocks.length; i++) {
            const len = blocks[i].length + 2;
            if (pos < running + len) return i;
            running += len;
        }
        return blocks.length - 1;
    }

    function applyTextToTimeline(text: string) {
        const blocks = splitBlocks(text);
        const seq = timelineSequence();

        blocks.forEach((block, i) => {
            const id = seq[i];
            if (!id) return;

            const item = timelineItems[id];
            if (!item) return;

            const lines = block.split("\n");
            const firstLine = lines[0]?.trim() || "";
            const body = lines.slice(1).join("\n").trim();

            if (item.type === "DIALOGUE") {
                const dlg = item as DialogueItem;
                dlg.characterName = firstLine;
                dlg.details = dlg.details || {};
                dlg.details.text = body;
                return;
            }

            const [maybeType, ...rest] = firstLine.split(" ");
            const upper = maybeType.toUpperCase();

            if (upper === item.type.toUpperCase()) {
                item.title = rest.join(" ").trim();
                item.details = item.details || {};
                item.details.text = body;
                return;
            }

            item.type = upper;
            item.title = rest.join(" ").trim();
            item.details = item.details || {};
            item.details.text = body;
        });
    }

    onMount(() => {
        const initialText = timelineToText();
        let updateTimeout: number | null = null;

        const state = EditorState.create({
            doc: initialText,
            extensions: [
                basicSetup,
                history(),
                keymap.of([...defaultKeymap, ...historyKeymap]),

                EditorView.updateListener.of(update => {
                    const text = update.state.doc.toString();

                    if (update.docChanged) {
                        if (updateTimeout) clearTimeout(updateTimeout);
                        updateTimeout = window.setTimeout(() => {
                            applyTextToTimeline(text);
                        }, 50);
                    }

                    if (update.selectionSet) {
                        const pos = update.state.selection.main.head;
                        const block = blockIndexAtPos(text, pos);
                        setCurrentBlock(block);
                    }
                })
            ]
        });

        view = new EditorView({
            state,
            parent: editorParent
        });
    });

    onCleanup(() => {
        view?.destroy();
        view = null;
    });

    // --- Compute the current timeline item ---
    const currentItem = () => {
        const idx = currentBlock();
        const seq = timelineSequence();
        const id = seq[idx];
        if (!id) return null;
        return timelineItems[id] || null;
    };

    return (
        <>
            {currentItem() && (
                <div class={styles.currentBlock}>
                    {currentItem()!.type === "DIALOGUE"
                        ? `DIALOGUE: ${(currentItem() as DialogueItem).characterName}`
                        : `${currentItem()!.type} ${currentItem()!.title || ""}`}
                </div>
            )}
            <article ref={editorParent} class={styles.typingEditor}>
            </article>
        </>
    );
}
