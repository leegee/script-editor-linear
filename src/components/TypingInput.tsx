import { onMount, onCleanup } from "solid-js";
import { EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { EditorState, Extension } from "@codemirror/state";
import { basicSetup } from "codemirror";
import { timelineItems, updateTimelineItem } from "../stores/timelineItems";
import { DialogueItem, TimelineItem } from "./CoreItems";

/**
 * Builds the editable document text from current timeline items
 */
function buildDocumentFromTimeline(items: Record<string, TimelineItem>): string {
    return Object.values(items)
        .map((item) => {
            if (item.type === "dialogue") {
                const d = item as DialogueItem;
                return `${d.characterName}:\n${d.details?.text ?? ""}`;
            } else {
                const header = `${item.type}${item.title ? ` ${item.title}` : ""}`;
                return `${header}\n${item.details?.text ?? ""}`;
            }
        })
        .join("\n\n"); // double newline between blocks
}

/**
 * Parses the editor text back into individual timeline items and updates shared state.
 */
function updateSharedStateFromDoc(doc: string) {
    const lines = doc.split("\n");
    const updatedItems = Object.values(timelineItems);
    let currentIndex = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const item = updatedItems[currentIndex];
        if (!item) break;

        if (item.type === "dialogue") {
            const nextLine = lines[i + 1] ?? "";
            updateTimelineItem(item.id, "details", "text", nextLine);
            i++;
        } else {
            const nextLine = lines[i + 1] ?? "";
            updateTimelineItem(item.id, "details", "text", nextLine);
            i++;
        }

        currentIndex++;
    }
}

/**
 * ViewPlugin to listen for changes and sync with the store
 */
const syncPlugin = ViewPlugin.fromClass(
    class {
        constructor(private view: EditorView) { }

        update(update: ViewUpdate) {
            if (update.docChanged) {
                const content = update.state.doc.toString();
                updateSharedStateFromDoc(content);
            }
        }
    }
);

export default function TypingInput() {
    let editorDiv!: HTMLDivElement;
    let view: EditorView | null = null;

    onMount(() => {
        const doc = buildDocumentFromTimeline(timelineItems);

        const state = EditorState.create({
            doc,
            extensions: [basicSetup, syncPlugin]
        });

        view = new EditorView({
            state,
            parent: editorDiv
        });
    });

    onCleanup(() => {
        view?.destroy();
    });

    return <article ref={editorDiv} class="typing-editor" />;
}
