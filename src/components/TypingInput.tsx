import { onMount, onCleanup, createSignal } from "solid-js";
import { EditorView, ViewUpdate, Decoration, DecorationSet, ViewPlugin } from "@codemirror/view";
import { EditorState, Range } from "@codemirror/state";
import { basicSetup } from "@codemirror/basic-setup";
import { history, undo, redo, undoDepth, redoDepth } from "@codemirror/commands";
import { autocompletion, Completion, CompletionContext } from "@codemirror/autocomplete";

import styles from "./TypingInput.module.scss";
import { createTimelineItemInstance, timelineItemTypesForTyping } from "../lib/timelineItemRegistry";
import { allCharacterNames, allLocationNames, findCharacterByName, findLocationByName, notes, tags, TagType, timelineItems, timelineSequence } from "../stores";
import { text2timelineItemsJson } from "../lib/text2timelineItems";
import { showAlert } from "../stores/modals";

export default function TypingInput() {
    let editorRef!: HTMLDivElement;
    const [view, setView] = createSignal<EditorView | null>(null);
    const [isDirty, setIsDirty] = createSignal(false);

    const completionSource = (context: CompletionContext) => {
        const word = context.matchBefore(/[@#\w]+$/);
        const line = context.state.doc.lineAt(context.pos);
        const textBeforeCursor = line.text.slice(0, context.pos - line.from);
        const trimmed = textBeforeCursor.trimStart();

        if (trimmed.startsWith("#")) {
            const allTags = Object.values(tags);
            return {
                from: line.from + textBeforeCursor.indexOf("#") + 1,
                options: allTags.map(tag => ({
                    label: tag.title,
                    detail: tag.id,
                    apply: tag.id,
                    type: "tag"
                })),
                validFor: /^\w*$/
            };
        }

        if (trimmed.startsWith("#")) {
            const allNotes = Object.values(notes);
            return {
                from: line.from + textBeforeCursor.indexOf("#") + 1,
                options: allNotes.map(note => ({
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

    // Plugin for highlighting invalid lines
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

    // Plugin for click detection on invalid lines
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
    });

    onCleanup(() => view()?.destroy());

    function handleHelp() {
        showAlert(
            <aside>
                <header class="no-padding">
                    <nav>
                        <i>help</i>
                        <h2 class="max">Help</h2>
                    </nav>
                </header>
                <p>The sample script is a good way to learn the syntax.</p>
                <p>If you have crated tags or notes in the List View, you can referenes to them
                    by using their IDs at the start of a line:
                </p>
                <pre>
                    <code>
                        #tagId<br />
                        @noteId
                    </code>
                </pre>
            </aside>
        );
    }

    function handleSave() {
        if (!view()) return;
        const parsed = text2timelineItemsJson(
            view()!.state.doc.toString(),
            timelineItemTypesForTyping,
            findCharacterByName,
            findLocationByName
        );
        const newTimelineItems = parsed.map(obj => createTimelineItemInstance(obj.type, obj.id));

        // todo: save timelineItems
        // console.log(JSON.stringify(newTimelineItems, null, 2))

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
                    <div class="tooltip bottom">Undo</div>
                </button>

                <button
                    class="icon small circle"
                    disabled={!view() || redoDepth(view()!.state) === 0}
                    onClick={() => view() && redo(view()!)}
                >
                    <i>redo</i>
                    <div class="tooltip bottom">Redo</div>
                </button>

                <button class="icon small circle" disabled={!isDirty()} onClick={handleSave}>
                    <i>save</i>
                    <div class="tooltip bottom">Save</div>
                </button>

                <button class="icon small circle" onClick={handleHelp}>
                    <i>help</i>
                    <div class="tooltip bottom">Help</div>
                </button>            </nav>
            <article class={styles.typingEditor} ref={editorRef}></article>
        </>
    );
}
