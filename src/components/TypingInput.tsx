// src/components/TypingInput.tsx
import { onMount, onCleanup, createSignal } from "solid-js";
import { EditorView, ViewUpdate, Decoration, DecorationSet, ViewPlugin } from "@codemirror/view";
import { EditorState, Range } from "@codemirror/state";
import { basicSetup } from "codemirror";
import { history, undo, redo, undoDepth, redoDepth } from "@codemirror/commands";

import styles from "./TypingInput.module.scss";
import { timelineItemTypesForTyping } from "../lib/timelineItemRegistry";
import { findCharacterByName, timelineItems, timelineSequence } from "../stores";

type TypingInputProps = {
    initialText: string;
    onSave: (text: string) => void;
};

export default function TypingInput(props: TypingInputProps) {
    let editorRef!: HTMLDivElement;
    const [editorView, setEditorView] = createSignal<EditorView | null>(null);
    const [isDirty, setIsDirty] = createSignal(false);

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
                    if (/^[A-Z0-9 _'-]+$/.test(trimmed)) {
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
                let lastHeaderValid = false;

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed) {
                        pos += line.length + 1;
                        continue;
                    }

                    const isAllCaps = /^[A-Z0-9 _'-]+$/.test(trimmed);
                    if (isAllCaps) {
                        const firstWord = trimmed.split(/\s+/)[0].toUpperCase();
                        const isKnownHeader = timelineItemTypesForTyping.includes(firstWord as Uppercase<string>);
                        const isKnownCharacter = findCharacterByName(trimmed.toUpperCase());

                        if (isKnownHeader || isKnownCharacter) {
                            lastHeaderValid = true;
                        } else {
                            lastHeaderValid = false;
                            builder.push(
                                Decoration.mark({
                                    class: "invalid-line",
                                    attributes: { title: "Unknown character or part" },
                                }).range(pos, pos + line.length)
                            );
                        }
                    } else {
                        lastHeaderValid = true; // attach body to previous header
                    }

                    pos += line.length + 1;
                }

                return Decoration.set(builder);
            }
        },
        { decorations: (v) => v.decorations }
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
                EditorView.lineWrapping,
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) setIsDirty(true);
                }),
            ],
        });

        const view = new EditorView({ state, parent: editorRef });
        setEditorView(view);
    });

    onCleanup(() => editorView()?.destroy());

    function handleSave() {
        const view = editorView();
        if (!view) return;
        const text = view.state.doc.toString();
        props.onSave(text);
        setIsDirty(false);
    }

    return (
        <>
            <nav class="right-align no-top-padding no-margin">
                <button
                    class="icon small circle"
                    disabled={!editorView() || undoDepth(editorView()!.state) === 0}
                    onClick={() => editorView() && undo(editorView()!)}
                >
                    <i>undo</i>
                    <div class="tooltip bottom">Undo</div>
                </button>

                <button
                    class="icon small circle"
                    disabled={!editorView() || redoDepth(editorView()!.state) === 0}
                    onClick={() => editorView() && redo(editorView()!)}
                >
                    <i>redo</i>
                    <div class="tooltip bottom">Redo</div>
                </button>

                <button class="icon small circle" disabled={!isDirty()} onClick={handleSave}>
                    <i>save</i>
                    <div class="tooltip bottom">Save</div>
                </button>
            </nav>
            <article class={styles.typingEditor} ref={editorRef}></article>
        </>
    );
}
