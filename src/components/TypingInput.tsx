// packages/client/src/components/TimelineEditor.tsx
import { createSignal, For } from "solid-js";
import { timelineItems, timelineSequence, createTimelineItem, replaceTimelineItem } from "../stores/timelineItems";
import { characters } from "../stores/characters";
import { TimelineItem, DialogueItem } from "../components/CoreItems";

export default function TimelineEditor() {
    let editorDiv: HTMLDivElement | undefined;
    let lastDialogueId: string | null = null;
    const [editorKey, setEditorKey] = createSignal(0);

    // Detect type for a line
    const detectType = (line: string, prevItem?: TimelineItem) => {
        const trimmed = line.trim();
        if (!trimmed) return { type: "beat" };

        if (/^ACT\s+\w+/i.test(trimmed)) return { type: "act" };
        if (/^(INT|EXT|INT\.\/EXT|EST)\./i.test(trimmed)) return { type: "scene" };

        const char = Object.values(characters).find(c => c.title.toUpperCase() === trimmed);
        if (char) return { type: "dialogue", char };

        if (prevItem?.type === "dialogue") return { type: "dialogue", appendToPrev: true, char: prevItem.details.ref };

        return { type: "beat" };
    };

    const handleInput = async (e: InputEvent) => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        let node: Node | null = range.startContainer;

        while (node && node.nodeType !== Node.ELEMENT_NODE) node = node.parentNode;
        if (!node) return;

        const lineDiv = node as HTMLElement;
        const lineText = lineDiv.innerText;
        const id = lineDiv.dataset.id;
        const prevItem = id ? timelineItems[id] : lastDialogueId ? timelineItems[lastDialogueId] : undefined;

        const { type, char, appendToPrev } = detectType(lineText, prevItem);

        if (type === "dialogue") {
            if (appendToPrev && lastDialogueId) {
                const prev = timelineItems[lastDialogueId];
                const newDetails = { ...prev.details, text: (prev.details.text ?? "") + "\n" + lineText };
                const newItem = prev.cloneWith({ details: newDetails });
                await replaceTimelineItem(prev.id, newItem);
            } else if (char) {
                const newItem = DialogueItem.createForCharacter(lineText, char.id);
                await createTimelineItem(newItem);
                lineDiv.dataset.id = newItem.id;
                lastDialogueId = newItem.id;
            }
        } else {
            const newItem: TimelineItem = new TimelineItem({
                id: id ?? Math.random().toString(36).slice(2, 9),
                type,
                title: "",
                details: { text: lineText },
                notes: [],
                duration: 0,
            });
            await createTimelineItem(newItem);
            lineDiv.dataset.id = newItem.id;
            lastDialogueId = null;
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter") setTimeout(() => setEditorKey(k => k + 1), 0);
    };

    return (
        <article
            ref={editorDiv}
            contentEditable
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            style={{
                "min-width": "400px",
                border: "1px solid #ccc",
                padding: "0.5rem",
                height: "calc(100% - 60pt)",
                "overflow-y": "auto",
                "white-space": "pre-wrap",
            }}
        >
            <For each={timelineSequence()}>
                {(id) => {
                    const item = timelineItems[id];
                    if (!item) return null;

                    if (item.type === "dialogue") {
                        const speaker = characters[item.details.ref]?.title.toUpperCase() ?? "UNKNOWN";
                        const text = item.details.text ?? "";
                        return (
                            <div data-id={item.id}>
                                {speaker}
                                {"\n"}
                                {text}
                            </div>
                        );
                    } else {
                        return <div data-id={item.id}>{item.details.text ?? item.title ?? ""}</div>;
                    }
                }}
            </For>
        </article>
    );
}
