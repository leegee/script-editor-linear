// TypingInput.tsx
import { onMount, onCleanup } from "solid-js";
import { EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { EditorState, Extension } from "@codemirror/state";
import { basicSetup } from "codemirror";
import { StreamLanguage } from "@codemirror/stream-parser";
import { timelineItems, timelineSequence, replaceTimelineItem, createTimelineItemAfter, deleteTimelineItem } from "../stores/timelineItems";
import { TimelineItem, DialogueItem } from "./CoreItems";
import { timelineItemTypesForTyping } from "../lib/timelineItemRegistry";

/* -----------------------
   Small Stream tokenizer
   -----------------------
   - HEADERS: ACT, SCENE, LOCATION, MUSIC, SOUNDFX, LIGHTING, BEAT
   - CHARACTER NAMES: lines of ALL CAPS or capitalised words (we mark as "name")
   - Everything else: plain text
*/
const typeRegex = new RegExp(`^(${timelineItemTypesForTyping.join("|")})\\b`);

const scriptLanguage = StreamLanguage.define({
    startState: () => ({}),
    token(stream) {
        if (stream.sol()) {
            // header lines starting with uppercase keyword (ACT, SCENE...)
            if (stream.match(typeRegex)) {
                return "keyword";
            }
            // CHARACTER NAME line (all caps or words with spaces, allow APOSTROPHE)
            if (stream.match(/^[A-Z][A-Z0-9' ]+$/)) {
                return "atom"; // use a token class for names
            }
        }
        // consume the rest of the line
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
        const typeLabel = (item.type || "").toUpperCase();
        const title = (item.title || "").trim();
        const body = (item.details?.text || "").trim();

        // If body exists, put it on a separate line
        if (body) return `${typeLabel}${title ? " " + title : ""}\n${body}`;
        else return `${typeLabel}${title ? " " + title : ""}`;
    }
}


function parseBlock(block: string) {
    const lines = block.split("\n");
    const headerLine = (lines[0] ?? "").trim();
    const bodyText = lines.slice(1).join("\n").trim();
    return { headerLine, bodyText };
}

/**
 * Infer item type/title/character from header line.
 * If header matches /^([A-Z]+)\s*(.*)$/ and the first token is a known TYPE,
 * treat as non-dialogue; otherwise treat as dialogue.
 */
const KNOWN_TYPES = new Set(["ACT", "SCENE", "LOCATION", "MUSIC", "SOUNDFX", "LIGHTING", "BEAT"]);

function inferFromHeader(headerLine: string) {
    const m = headerLine.match(/^([A-Z]+)\s*(.*)$/);
    if (m && KNOWN_TYPES.has(m[1].toUpperCase())) {
        return { type: m[1].toLowerCase(), title: (m[2] || "").trim(), characterName: null };
    } else {
        // dialogue header
        return { type: "dialogue", title: null, characterName: headerLine };
    }
}

/* -----------------------
   Sync plugin
   ----------------------- */
const syncPlugin = ViewPlugin.fromClass(
    class {
        constructor(view: EditorView) {
            // nothing to initialize here
        }

        async update(update: ViewUpdate) {
            if (!update.docChanged) return;

            const doc = update.state.doc.toString();
            // Split into blocks by two or more newlines (keeps editor flexible)
            const blocks = doc.split(/\n{2,}/g).map(b => b.trim()).filter(b => b.length || true);
            const seq = timelineSequence();

            // If blocks > seq -> we will create new items where needed
            // If blocks < seq -> we will delete trailing items
            // We map by index: block i -> seq[i]

            for (let i = 0; i < blocks.length; i++) {
                const block = blocks[i];
                const { headerLine, bodyText } = parseBlock(block);

                if (i < seq.length) {
                    const id = seq[i];
                    const existing = timelineItems[id];
                    if (!existing) continue;

                    if (existing.type === "dialogue") {
                        if (existing.type === "dialogue") {
                            const dialogue = existing as DialogueItem;
                            await dialogue.updateCharacterAndText(headerLine, bodyText);
                        }
                    }
                    else {
                        // non-dialogue
                        const headerMatch = headerLine.match(/^([A-Z]+)\s*(.*)$/);
                        if (!headerMatch) continue;

                        const type = headerMatch[1].toLowerCase();
                        const title = headerMatch[2]?.trim() || "";
                        const currentTitle = existing.title || "";
                        const currentBody = existing.details?.text || "";

                        if (title !== currentTitle || bodyText !== currentBody || type !== existing.type) {
                            const cloned = existing.cloneWith({
                                type,
                                title,
                                details: { ...(existing.details || {}), text: bodyText }
                            });
                            await replaceTimelineItem(id, cloned);
                        }
                    }
                } else {
                    // create new item if needed
                    const prevId = seq[seq.length - 1] ?? "";
                    const inferred = inferFromHeader(headerLine);

                    const props = inferred.type === "dialogue"
                        ? { text: bodyText, ref: null }
                        : { title: inferred.title, text: bodyText };

                    await createTimelineItemAfter(prevId, inferred.type, props);
                }
            }

            // Delete trailing items if user removed blocks
            if (blocks.length < seq.length) {
                for (let j = blocks.length; j < seq.length; j++) {
                    const idToDelete = seq[j];
                    deleteTimelineItem(idToDelete).catch(err => console.error("deleteTimelineItem err", err));
                }
            }
        }
    }
);

/* -----------------------
   Component
   ----------------------- */
export default function TypingInput() {
    let parentEl!: HTMLDivElement;
    let view: EditorView | null = null;

    onMount(() => {
        // Build initial document from timelineSequence (order matters)
        const doc = timelineSequence()
            .map(id => renderItemToBlock(id))
            .join("\n\n");

        const extensions: Extension[] = [
            basicSetup,
            scriptLanguage,
            syncPlugin
        ];

        const state = EditorState.create({ doc, extensions });

        view = new EditorView({
            state,
            parent: parentEl
        });
    });

    onCleanup(() => {
        view?.destroy();
    });

    return <>
        <article ref={parentEl} class="typing-editor" />
    </>;
}
