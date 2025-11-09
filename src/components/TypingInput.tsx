// TypingInput.tsx
import styles from './TypingInput.module.scss';
import { onMount, onCleanup, createSignal } from "solid-js";
import { EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
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
        const header = (d.characterName || "").trim();
        const body = (d.details?.text || "").trim();
        return header + (body ? `\n${body}` : "");
    } else {
        const typeLabel = (item.type || "").toLocaleUpperCase();
        const title = (item.title || "").trim();
        const body = (item.details?.text || "").trim();
        console.log(body ? `${typeLabel}${title ? " " + title : ""}\n${body}` : `${typeLabel}${title ? " " + title : ""}`)
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
// Sync and debug plugin
function createSyncPlugin(setCurrentBlockInfo: (info: string) => void) {
    return ViewPlugin.fromClass(
        class {
            view: EditorView;
            constructor(view: EditorView) {
                this.view = view;
                this.updateCursorInfo();
            }

            async update(update: ViewUpdate) {
                if (update.docChanged) await this.syncTimeline(update.state);
                if (update.selectionSet || update.docChanged) this.updateCursorInfo();
            }

            private updateCursorInfo() {
                const { from } = this.view.state.selection.main;
                const docText = this.view.state.doc.toString();
                const blocks = docText.split(/\n{2,}/g).map(b => b.trim()).filter(Boolean);

                let accumulated = 0;
                let blockIndex = -1;

                for (let i = 0; i < blocks.length; i++) {
                    const b = blocks[i];
                    const blockStart = accumulated;
                    const blockEnd = accumulated + b.length;

                    if (from >= blockStart && from <= blockEnd) {
                        blockIndex = i;
                        break;
                    }
                    accumulated += b.length + 2; // +2 for the two newlines between blocks
                }

                const seq = timelineSequence();
                let info = "No block found";

                if (blockIndex >= 0 && blockIndex < seq.length) {
                    const id = seq[blockIndex];
                    const item = timelineItems[id];
                    const blockText = blocks[blockIndex];
                    const { headerLine, bodyText } = parseBlock(blockText);

                    if (item) {
                        info = `#${item.id} [${item.type}] header: "${headerLine}" body: "${bodyText}"`;
                    }
                }

                setCurrentBlockInfo(info);
            }


            private async syncTimeline(state: EditorState) {
                const doc = state.doc.toString();
                const blocks = doc.split(/\n{2,}/g).map(b => b.trim()).filter(b => true);
                const seq = timelineSequence();

                for (let i = 0; i < blocks.length; i++) {
                    const block = blocks[i];
                    const { headerLine, bodyText } = parseBlock(block);

                    if (i < seq.length) {
                        const id = seq[i];
                        const existing = timelineItems[id];
                        if (!existing) continue;

                        if (existing.type === "dialogue") {
                            const dialogue = existing as DialogueItem;
                            await dialogue.update(headerLine, bodyText);
                            await replaceTimelineItem(id, dialogue);
                        } else {
                            const headerMatch = headerLine.match(/^([A-Z]+)\s*(.*)$/);
                            if (!headerMatch) continue;
                            const type = headerMatch[1].toLocaleLowerCase();
                            const title = headerMatch[2]?.trim() || "";
                            if (type !== existing.type || title !== existing.title || bodyText !== (existing.details?.text || "")) {
                                const cloned = existing.cloneWith({
                                    type,
                                    title,
                                    details: { ...(existing.details || {}), text: bodyText }
                                });
                                await replaceTimelineItem(id, cloned);
                            }
                        }
                    } else {
                        const prevId = seq[seq.length - 1] ?? "";
                        const inferred = inferFromHeader(headerLine);
                        const props = inferred.type === "dialogue" ? { text: bodyText, ref: null } : { title: inferred.title, text: bodyText };
                        await createTimelineItemAfter(prevId, inferred.type, props);
                    }
                }

                if (blocks.length < seq.length) {
                    for (let j = blocks.length; j < seq.length; j++) {
                        await deleteTimelineItem(seq[j]).catch(err => console.error("deleteTimelineItem err", err));
                    }
                }
            }
        }
    );
}

export default function TypingInput() {
    let parentEl!: HTMLDivElement;
    const [currentBlockInfo, setCurrentBlockInfo] = createSignal("No block selected");
    let view: EditorView | null = null;

    onMount(() => {
        const doc = timelineSequence().map(id => renderItemToBlock(id)).join("\n\n");
        const extensions: Extension[] = [basicSetup, scriptLanguage, createSyncPlugin(setCurrentBlockInfo)];
        const state = EditorState.create({ doc, extensions });

        view = new EditorView({ state, parent: parentEl });
    });

    onCleanup(() => view?.destroy());

    return <>
        <div class="block-debug-info" style="padding: 0.25rem; font-size: 0.9em; color: #555;">
            {currentBlockInfo()}
        </div>
        <article ref={parentEl} class={styles.typingEditor} />
    </>;
}
