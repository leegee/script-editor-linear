import { onMount, onCleanup } from "solid-js";
import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate, WidgetType } from "@codemirror/view";
import { EditorState, RangeSetBuilder } from "@codemirror/state";
import { basicSetup } from "codemirror";
import {
    timelineItems,
    timelineSequence,
    updateTimelineItem,
    createTimelineItemAfter,
    deleteTimelineItem
} from "../stores/timelineItems";
import { DialogueItem } from "./CoreItems";

// === Hidden marker widget ===
class HiddenMarkerWidget extends WidgetType {
    constructor(readonly id: string) {
        super();
    }
    eq(other: HiddenMarkerWidget) {
        return this.id === other.id;
    }
    toDOM() {
        const span = document.createElement("span");
        span.textContent = `<!--ID:${this.id}-->`;
        span.style.display = "none";
        return span;
    }
}

// === Build decoration set based on sequence ===
function buildDecorations(): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();
    let pos = 0;

    for (const id of timelineSequence()) {
        const widget = Decoration.widget({
            widget: new HiddenMarkerWidget(id),
            side: -1
        });
        builder.add(pos, pos, widget);

        const text = timelineItems[id]?.details?.text ?? "";
        pos += text.length + 2;
    }

    return builder.finish();
}

// === CM6 plugin to sync editor <-> Solid store ===
const syncPlugin = ViewPlugin.fromClass(
    class {
        decorations: DecorationSet;

        constructor(view: EditorView) {
            this.decorations = buildDecorations();
        }

        update(update: ViewUpdate) {
            if (!update.docChanged) return;

            const text = update.state.doc.toString();
            const markerRegex = /<!--ID:([a-zA-Z0-9_-]+)-->/g;
            const seenIds = new Set<string>();
            let match: RegExpExecArray | null;

            while ((match = markerRegex.exec(text))) {
                const id = match[1];
                seenIds.add(id);

                // Find next marker, get block text
                const start = match.index + match[0].length;
                const nextMarkerPos = text.indexOf("<!--ID:", start);
                const blockText = text.substring(start, nextMarkerPos === -1 ? undefined : nextMarkerPos).trim();

                if (timelineItems[id]) {
                    // ✅ Update existing item content in shared store
                    updateTimelineItem(id, "details", "text", blockText);
                } else {
                    // 🆕 Create a new item if marker appears unexpectedly
                    console.warn("Unknown ID found in editor; creating new item", id);
                    createTimelineItemAfter(timelineSequence()[timelineSequence().length - 1], "dialogue", { text: blockText });
                }
            }

            // 🗑 Remove deleted items
            for (const id of timelineSequence()) {
                if (!seenIds.has(id)) {
                    deleteTimelineItem(id);
                }
            }
        }
    },
    {
        decorations: v => v.decorations
    }
);

// === Main editor component ===
export default function TypingInput() {
    let parentEl!: HTMLDivElement;
    let view: EditorView | null = null;

    onMount(() => {
        // Build doc string from current sequence
        const doc = timelineSequence()
            .map((id) => {
                const item = timelineItems[id];
                if (item.type === 'dialogue') {
                    const charName = (item as DialogueItem).characterName;
                    return `<!--ID:${id}-->\n${charName} ${charName}\n${item.details.text}`;
                } else {
                    const typeLabel = item?.type?.toUpperCase() ?? "";
                    const body = item?.details?.text ?? "";
                    return `<!--ID:${id}-->\n${typeLabel} ${item.title ?? ''}\n${body}`;

                }
            })
            .join("\n\n");

        const state = EditorState.create({
            doc,
            extensions: [
                basicSetup,
                syncPlugin
            ]
        });

        view = new EditorView({ state, parent: parentEl });
    });

    onCleanup(() => {
        view?.destroy();
    });

    return <article ref={parentEl} class="typing-editor" />;
}
