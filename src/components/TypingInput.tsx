// TypingInput.tsx
import styles from "./TypingInput.module.scss";
import { onMount, onCleanup, createSignal, createEffect } from "solid-js";
import { EditorView, ViewUpdate } from "@codemirror/view";
import { EditorState, Extension } from "@codemirror/state";
import { basicSetup } from "codemirror";
import { StreamLanguage } from "@codemirror/stream-parser";
import { DialogueItem } from "./CoreItems";
import { timelineItemTypesForTyping, TimelineItemTypeType, TimelineItemUpper } from "../lib/timelineItemRegistry";
import {
    timelineItems,
    timelineSequence,
    replaceTimelineItem,
    createTimelineItemAfter,
    deleteTimelineItem
} from "../stores/timelineItems";

// ---- GLOBAL SUPPRESSION FLAG ----
let suppressExternalSync = false;

const KNOWN_TYPES = new Set(timelineItemTypesForTyping);
const typeRegex = new RegExp(`^(${timelineItemTypesForTyping.join("|")})\\b`);

const scriptLanguage = StreamLanguage.define({
    startState: () => ({}),
    token(stream) {
        if (stream.sol()) {
            if (stream.match(typeRegex)) return "keyword";
            if (stream.match(/^[\p{Lu}][\p{Lu}0-9' ]+$/u)) return "atom";
        }
        stream.skipToEnd();
        return null;
    }
});

function renderItemToBlock(id: string): string {
    const item = timelineItems[id];
    if (!item) return "";

    if (item.type === "dialogue") {
        const d = item as DialogueItem;
        const header = (d.characterName || "").trim().toUpperCase();
        const body = (d.details?.text || "").trim();
        return header + (body ? `\n${body}` : "");
    } else {
        const typeLabel = (item.type || "").toUpperCase();
        const title = (item.title || "").trim();
        const body = (item.details?.text || "").trim();
        return body ? `${typeLabel}${title ? " " + title : ""}\n${body}` : `${typeLabel}${title ? " " + title : ""}`;
    }
}

function parseBlock(block: string) {
    const lines = block.split("\n");
    const headerLine = (lines[0] ?? "").trim();
    const bodyText = lines.slice(1).join("\n").trim();
    return { headerLine, bodyText };
}

function inferFromHeader(headerLine: string) {
    const m = headerLine.match(/^([A-Z]+)\s*(.*)$/);
    if (m && KNOWN_TYPES.has(m[1].toUpperCase() as TimelineItemUpper)) {
        return { type: m[1].toLowerCase() as TimelineItemTypeType, title: (m[2] || "").trim(), characterName: null };
    } else {
        return { type: "dialogue" as const, title: null, characterName: headerLine };
    }
}

// ---- TYPING INPUT COMPONENT ----
export default function TypingInput() {
    let parentEl!: HTMLDivElement;
    const [currentBlockInfo, setCurrentBlockInfo] = createSignal("No block selected");
    let view: EditorView | null = null;

    onMount(() => {
        // initialize editor with current timelineSequence
        const doc = timelineSequence().map(id => renderItemToBlock(id)).join("\n\n");
        const extensions: Extension[] = [
            basicSetup,
            scriptLanguage,
            EditorView.updateListener.of(async (update: ViewUpdate) => {
                if (update.docChanged && !suppressExternalSync) {
                    // push user edits to store
                    const blocks = update.state.doc.toString().split(/\n{2,}/g).map(b => b.trim()).filter(Boolean);
                    const seq = timelineSequence();

                    for (let i = 0; i < blocks.length; i++) {
                        const blockText = blocks[i];
                        const { headerLine, bodyText } = parseBlock(blockText);
                        const seqId = seq[i];
                        const inferred = inferFromHeader(headerLine);

                        if (seqId) {
                            const existing = timelineItems[seqId];
                            if (!existing) continue;

                            if (existing.type === "dialogue") {
                                const dialogue = existing as DialogueItem;
                                if (dialogue.characterName !== inferred.characterName || (dialogue.details?.text || "") !== bodyText) {
                                    await dialogue.update(headerLine, bodyText);
                                    await replaceTimelineItem(seqId, dialogue);
                                }
                            } else {
                                const type = headerLine.match(/^([A-Z]+)\s*(.*)$/)?.[1]?.toLowerCase();
                                const title = headerLine.match(/^([A-Z]+)\s*(.*)$/)?.[2]?.trim() || "";
                                if (type !== existing.type || title !== existing.title || bodyText !== (existing.details?.text || "")) {
                                    const cloned = existing.cloneWith({
                                        type,
                                        title,
                                        details: { ...(existing.details || {}), text: bodyText }
                                    });
                                    await replaceTimelineItem(seqId, cloned);
                                }
                            }
                        } else {
                            // new block appended
                            const prevId = seq[seq.length - 1] ?? "";
                            const props = inferred.type === "dialogue" ? { text: bodyText, ref: null } : { title: inferred.title, text: bodyText };
                            await createTimelineItemAfter(prevId, inferred.type, props);
                        }
                    }

                    // delete removed blocks
                    if (blocks.length < seq.length) {
                        for (let j = blocks.length; j < seq.length; j++) {
                            await deleteTimelineItem(seq[j]).catch(console.error);
                        }
                    }
                }

                if (update.selectionSet) {
                    // update cursor debug info
                    const from = update.state.selection.main.from;
                    const blocks = update.state.doc.toString().split(/\n{2,}/g).map(b => b.trim()).filter(Boolean);
                    let accumulated = 0, blockIndex = -1;
                    for (let i = 0; i < blocks.length; i++) {
                        const b = blocks[i];
                        if (from >= accumulated && from <= accumulated + b.length + 1) {
                            blockIndex = i;
                            break;
                        }
                        accumulated += b.length + 2;
                    }
                    const seq = timelineSequence();
                    let info = "No block found";
                    if (blockIndex >= 0 && blockIndex < seq.length) {
                        const id = seq[blockIndex];
                        const item = timelineItems[id];
                        const { headerLine, bodyText } = parseBlock(blocks[blockIndex]);
                        if (item) info = `#${item.id} [${item.type}] header: "${headerLine}" body: "${bodyText}"`;
                    }
                    setCurrentBlockInfo(info);
                }
            })
        ];

        view = new EditorView({ state: EditorState.create({ doc, extensions }), parent: parentEl });

        createEffect(() => {
            const newDoc = timelineSequence().map(id => renderItemToBlock(id)).join("\n\n");

            if (!view) return;
            const cur = view.state.doc.toString();
            if (newDoc !== cur) {
                suppressExternalSync = true;
                view.dispatch({ changes: { from: 0, to: cur.length, insert: newDoc } });
                suppressExternalSync = false;
            }
        });

        onCleanup(() => {
            view?.destroy();
        });
    });

    return <>
        <div class="block-debug-info" style="padding: 0.25rem; font-size: 0.9em; color: #999;">
            {currentBlockInfo()}
        </div>
        <article ref={parentEl} class={styles.typingEditor} />
    </>;
}
