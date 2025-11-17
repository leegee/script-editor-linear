import { onMount, onCleanup, createSignal } from "solid-js";
import { EditorView, ViewUpdate, Decoration, DecorationSet, ViewPlugin, hoverTooltip } from "@codemirror/view";
import { EditorState, Range } from "@codemirror/state";
import { basicSetup } from "@codemirror/basic-setup";
import { history, undo, redo, undoDepth, redoDepth } from "@codemirror/commands";
import { autocompletion, CompletionContext } from "@codemirror/autocomplete";

import styles from "./TypingInput.module.scss";
import { timelineItemTypesForTyping } from "../lib/timelineItemRegistry";
import { text2timelineItemsJson } from "../lib/text2timelineItems";
import { showAlert } from "../stores/modals";
import {
    addTimelineItems, allCharacterNames, allLocationNames, deleteAllTimelineItems, findCharacterByName,
    findLocationByName, loadAll, notes, tags, timelineItems, timelineSequence
} from "../stores";

// Regex to find identifiers around mouse position
const tagMatch = /#([A-Za-z0-9_-]+)/g;
const noteMatch = /&([A-Za-z0-9_-]+)/g;

export default function TypingInput() {
    let editorRef!: HTMLDivElement;
    const [view, setView] = createSignal<EditorView | null>(null);
    const [isDirty, setIsDirty] = createSignal(false);

    const completionSource = (context: CompletionContext) => {
        const word = context.matchBefore(/[@#\w]+$/);
        const line = context.state.doc.lineAt(context.pos);
        const textBeforeCursor = line.text.slice(0, context.pos - line.from);
        const trimmed = textBeforeCursor.trimStart();

        // tags
        if (trimmed.startsWith("#")) {
            const prefix = trimmed.slice(1).toLowerCase();
            const allTags = Object.values(tags);
            const filtered = prefix
                ? allTags.filter(t => t.title.toLowerCase().includes(prefix))
                : allTags;

            return {
                from: line.from + textBeforeCursor.indexOf("#") + 1,
                options: filtered.map(tag => ({
                    label: tag.title,
                    detail: tag.id,
                    apply: tag.id,
                    type: "tag"
                })),
                validFor: /^\w*$/
            };
        }

        // notes
        if (trimmed.startsWith("&")) {
            const prefix = trimmed.slice(1).toLowerCase();
            const allNotes = Object.values(notes);
            const filtered = prefix
                ? allNotes.filter(t => t.title.toLowerCase().includes(prefix))
                : allNotes;

            return {
                from: line.from + textBeforeCursor.indexOf("&") + 1,
                options: filtered.map(note => ({
                    label: note.title,
                    detail: note.id,
                    apply: note.id,
                    type: "tag"
                })),
                validFor: /^\w*$/
            };
        }

        if (!word) {
            if (textBeforeCursor.trimEnd().endsWith("LOCATION")) {
                return {
                    from: context.pos,
                    options: allLocationNames().map(loc => ({ label: loc, type: "variable" })),
                    validFor: /.*/
                };
            }
            return null;
        }

        return {
            from: word.from,
            options: [
                ...timelineItemTypesForTyping.map(h => ({ label: h, type: "keyword" })),
                ...allCharacterNames().map(c => ({ label: c, type: "variable" }))
            ],
            validFor: /^\w*$/
        };
    };

    // Plugin to show title title of tags/notes that render as ID
    const tagNoteTooltipPlugin = hoverTooltip((view, pos) => {
        const { doc } = view.state;
        const line = doc.lineAt(pos);
        const text = line.text;
        const offset = pos - line.from;

        // Helper to locate a match that contains pos
        function findMatch(regex: RegExp) {
            let m;
            while ((m = regex.exec(text))) {
                const start = m.index;
                const end = start + m[0].length;

                if (start <= offset && offset <= end) {
                    return {
                        id: m[1],
                        from: line.from + start,
                        to: line.from + end,
                    };
                }
            }
            return null;
        }

        let found = findMatch(tagMatch);
        if (found) {
            const tag = tags[found.id];
            if (!tag) return null;

            return {
                pos: found.from,
                end: found.to,
                above: true,
                create() {
                    const dom = document.createElement("div");
                    dom.className = "cm-tooltip-tag large-elevate small-padding";
                    dom.style.setProperty("--this-clr", tag.details.clr);
                    dom.innerHTML = `<span>${tag.title}</span>`;
                    return { dom };
                }
            };
        }

        found = findMatch(noteMatch);
        if (found) {
            const note = notes[found.id];
            if (!note) return null;

            return {
                pos: found.from,
                end: found.to,
                above: true,
                create() {
                    const dom = document.createElement("div");
                    dom.className = "cm-tooltip-note large-elevate small-padding";
                    dom.innerHTML = note.urlForInnerHtml("tiny") + '<h6>' + note.title + '</h6>';
                    return { dom };
                }
            };
        }

        return null;
    });


    // Plugin to highlight invalid lines
    const highlightInvalidLines = ViewPlugin.fromClass(
        class {
            decorations: DecorationSet;
            constructor(view: EditorView) {
                this.decorations = this.buildDecorations(view);
            }
            update(update: ViewUpdate) {
                if (update.docChanged || update.viewportChanged) {
                    this.decorations = this.buildDecorations(update.view);
                }
            }
            buildDecorations(view: EditorView) {
                const builder: Range<Decoration>[] = [];
                const text = view.state.doc.toString();
                const lines = text.split("\n");
                let pos = 0;

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed) { pos += line.length + 1; continue; }

                    const isAllCaps = /^[A-Z0-9 _'-]+$/.test(trimmed);
                    if (isAllCaps) {
                        const firstWord = trimmed.split(/\s+/)[0].toUpperCase();
                        const isKnownHeader = timelineItemTypesForTyping.includes(firstWord as Uppercase<string>);
                        const isKnownCharacter = findCharacterByName(trimmed.toUpperCase());

                        if (!isKnownHeader && !isKnownCharacter) {
                            builder.push(
                                Decoration.mark({
                                    class: "invalid-line",
                                    attributes: { title: "Unknown character or part" },
                                }).range(pos, pos + line.length)
                            );
                        }
                    }

                    pos += line.length + 1;
                }

                return Decoration.set(builder);
            }
        },
        { decorations: (v) => v.decorations }
    );

    // TEST Plugin for click detection on invalid lines
    const clickPlugin = ViewPlugin.fromClass(
        class {
            constructor(public view: EditorView) { }
            update() { }
        },
        {
            eventHandlers: {
                click(event, view) {
                    const pos = view.posAtDOM(event.target as HTMLElement);
                    const line = view.state.doc.lineAt(pos);
                    const trimmed = line.text.trim();

                    const isAllCaps = /^[A-Z0-9 _'-]+$/.test(trimmed);
                    if (isAllCaps) {
                        const firstWord = trimmed.split(/\s+/)[0].toUpperCase();
                        const isKnownHeader = timelineItemTypesForTyping.includes(firstWord as Uppercase<string>);
                        const isKnownCharacter = findCharacterByName(trimmed.toUpperCase());

                        if (!isKnownHeader && !isKnownCharacter) {
                            alert(`Clicked invalid line: "${trimmed}"`);
                        }
                    }
                },
            },
        }
    );

    onMount(() => {
        const initialText = timelineSequence()
            .map((id) => timelineItems[id].renderAsText())
            .join("\n\n");

        const state = EditorState.create({
            doc: initialText,
            extensions: [
                basicSetup,
                highlightInvalidLines,
                tagNoteTooltipPlugin,
                clickPlugin,
                history(),
                autocompletion({ override: [completionSource] }),
                EditorView.lineWrapping,
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) setIsDirty(true);
                }),
            ],
        });

        const v = new EditorView({ state, parent: editorRef });
        setView(v);

        // Keybindings
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener("keydown", handleKeyDown);

        onCleanup(() => {
            v.destroy();
            window.removeEventListener("keydown", handleKeyDown);
        });
    });

    onMount(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty()) {
                e.preventDefault();
                e.returnValue = "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        onCleanup(() => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        });
    });

    onCleanup(() => {
        if (isDirty()) handleSave();
        view()?.destroy();
    });

    function handleHelp() {
        showAlert(
            <aside>
                <header class="no-padding">
                    <nav>
                        <i>help</i>
                        <h2 class="max">Help</h2>
                    </nav>
                </header>
                <p>Your changes only take effect when you save them ysing the save button or <kbd>CTRL S</kbd></p>
                <p>If you have created tags or notes, you can referenes to them
                    by using their IDs at the start of a line:
                </p>
                <pre>
                    <code> #tagId, &noteId, ^5 </code>
                </pre>
                <p>You can specify duration in secconds of a dialogue item like this:</p>
                <pre>
                    <code> ^5 </code>
                </pre>
            </aside>
        );
    }

    async function handleSave() {
        if (!view()) return;
        const parsed = text2timelineItemsJson(
            view()!.state.doc.toString(),
            timelineItemTypesForTyping,
            findCharacterByName,
            findLocationByName
        );

        // console.log( JSON.stringify(parsed, null, 4) )

        await deleteAllTimelineItems();
        await addTimelineItems(parsed);
        await loadAll();

        setIsDirty(false);
    }

    return (
        <>
            <nav class="right-align no-top-padding no-margin">
                <button
                    class="icon small circle"
                    disabled={!view() || undoDepth(view()!.state) === 0}
                    onClick={() => view() && undo(view()!)}
                >
                    <i>undo</i>
                    <div class="tooltip left">Undo</div>
                </button>

                <button
                    class="icon small circle"
                    disabled={!view() || redoDepth(view()!.state) === 0}
                    onClick={() => view() && redo(view()!)}
                >
                    <i>redo</i>
                    <div class="tooltip left">Redo</div>
                </button>

                <button class="icon small circle" disabled={!isDirty()} onClick={handleSave}>
                    <i>save</i>
                    <div class="tooltip left">Save (<kbd>CTRL S</kbd>)</div>
                </button>

                <button class="icon small circle" onClick={handleHelp}>
                    <i>help</i>
                    <div class="tooltip left">Help</div>
                </button>            </nav>
            <article class={styles.typingEditor} ref={editorRef}></article>
        </>
    );
}
