import { onMount, onCleanup, createSignal } from "solid-js";
import { EditorView, ViewUpdate, Decoration, DecorationSet, ViewPlugin } from "@codemirror/view";
import { EditorState, Range } from "@codemirror/state";
import { basicSetup } from "codemirror";

import styles from "./TypingInput.module.scss";
import { timelineItemTypesForTyping } from "../lib/timelineItemRegistry";
import { allCharacterNames, timelineItems, timelineSequence } from "../stores";

type TypingInputProps = {
    initialText: string;
    onSave: (text: string) => void;
};

export default function TypingInput(props: TypingInputProps) {
    let editorRef!: HTMLDivElement;
    let view: EditorView;
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
                        const isKnownCharacter = allCharacterNames().includes(trimmed.toUpperCase());
                        if (!isKnownHeader && !isKnownCharacter) {
                            alert(`Clicked invalid line: "${trimmed}"`);
                        }
                    }
                },
            },
        }
    );

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
                let lastHeaderValid = false;

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed) { pos += line.length + 1; continue; }

                    const isAllCaps = /^[A-Z0-9 _'-]+$/.test(trimmed);

                    if (isAllCaps) {
                        const firstWord = trimmed.split(/\s+/)[0].toUpperCase();
                        const isKnownHeader = timelineItemTypesForTyping.includes(firstWord as Uppercase<string>);
                        const isKnownCharacter = allCharacterNames().includes(trimmed.toUpperCase());

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
                        // body attaches to previous header
                        lastHeaderValid = true;
                    }

                    pos += line.length + 1;
                }

                return Decoration.set(builder);
            }

        },
        { decorations: (v) => v.decorations }
    );

    onMount(() => {
        const initialText = timelineSequence().map(
            id => timelineItems[id].renderAsText()
        ).join("\n\n");

        const state = EditorState.create({
            doc: initialText,
            extensions: [
                basicSetup,
                highlightInvalidLines,
                clickPlugin,
                EditorView.lineWrapping,
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        setIsDirty(true);
                    }
                }),
            ],
        });

        view = new EditorView({
            state,
            parent: editorRef,
        });
    });

    onCleanup(() => view?.destroy());

    function handleSave() {
        const text = view.state.doc.toString();
        props.onSave(text);
        setIsDirty(false);
    }

    return (
        <div class={styles.wrapper}>
            <div class={styles.editor} ref={editorRef}></div>
            <button class={styles.saveButton} disabled={!isDirty()} onClick={handleSave}>
                Save
            </button>
        </div>
    );
}
