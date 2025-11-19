import { onMount, onCleanup, createSignal, createEffect } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";

import {
    EditorView, ViewUpdate, Decoration, DecorationSet,
    ViewPlugin, hoverTooltip
} from "@codemirror/view";
import { EditorState, Range } from "@codemirror/state";
import { basicSetup } from "@codemirror/basic-setup";
import { history, undo, redo, undoDepth, redoDepth } from "@codemirror/commands";
import { autocompletion, CompletionContext } from "@codemirror/autocomplete";

import styles from "./TypingInput.module.scss";
import { useChildRoute } from "../contexts/ChildRoute";
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

function showHelp() {
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

export default function TypingInput() {
    const location = useLocation();
    const navigate = useNavigate();
    const { childRoute } = useChildRoute();
    const [view, setView] = createSignal<EditorView | null>(null);
    const [isDirty, setIsDirty] = createSignal(false);
    let editorRef!: HTMLDivElement;

    const findMatchAtPos = (regex: RegExp, text: string, offset: number) => {
        let m;
        while ((m = regex.exec(text))) {
            const start = m.index;
            const end = start + m[0].length;
            if (start <= offset && offset < end) {
                return { id: m[1], from: start, to: end };
            }
        }
        return null;
    };

    const buildTooltip = (content: string, className: string, style?: Record<string, string>) => {
        const dom = document.createElement("div");
        dom.className = className;
        if (style) {
            Object.entries(style).forEach(([k, v]) => dom.style.setProperty(k, v));
        }
        dom.innerHTML = content;
        return { dom };
    };

    const completionSource = (context: CompletionContext) => {
        const word = context.matchBefore(/[@#\w]+$/);
        const line = context.state.doc.lineAt(context.pos);
        const textBeforeCursor = line.text.slice(0, context.pos - line.from).trimStart();

        // Tags
        if (textBeforeCursor.startsWith("#")) {
            const prefix = textBeforeCursor.slice(1).toLowerCase();
            const filtered = prefix
                ? Object.values(tags).filter(t => t.title.toLowerCase().includes(prefix))
                : Object.values(tags);

            return {
                from: line.from + textBeforeCursor.indexOf("#") + 1,
                options: filtered.map(t => ({ label: t.title, detail: t.id, apply: t.id, type: "tag" })),
                validFor: /^\w*$/
            };
        }

        // Notes
        if (textBeforeCursor.startsWith("&")) {
            const prefix = textBeforeCursor.slice(1).toLowerCase();
            const filtered = prefix
                ? Object.values(notes).filter(n => n.title.toLowerCase().includes(prefix))
                : Object.values(notes);

            return {
                from: line.from + textBeforeCursor.indexOf("&") + 1,
                options: filtered.map(n => ({ label: n.title, detail: n.id, apply: n.id, type: "tag" })),
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

    const tooltipPlugin = hoverTooltip((view, pos) => {
        const { doc } = view.state;
        const line = doc.lineAt(pos);
        const offset = pos - line.from;
        const text = line.text;

        // Check tag
        let found = findMatchAtPos(tagMatch, text, offset);
        if (found) {
            const tag = tags[found.id];
            if (!tag) return null;
            return {
                pos: line.from + found.from, end: line.from + found.to, above: true,
                create: () => buildTooltip(`<span>${tag.title}</span>`, "cm-tooltip-tag large-elevate small-padding", { "--this-clr": tag.details.clr })
            };
        }

        // Check note
        found = findMatchAtPos(noteMatch, text, offset);
        if (found) {
            const note = notes[found.id];
            if (!note) return null;
            return {
                pos: line.from + found.from, end: line.from + found.to, above: true,
                create: () => buildTooltip(note.urlForInnerHtml("tiny") + `<h6>${note.title}</h6>`, "cm-tooltip-note large-elevate small-padding")
            };
        }

        return null;
    });

    const highlightInvalidLines = ViewPlugin.fromClass(
        class {
            decorations: DecorationSet;
            constructor(view: EditorView) { this.decorations = this.buildDecorations(view); }
            update(update: ViewUpdate) {
                if (update.docChanged || update.viewportChanged) {
                    this.decorations = this.buildDecorations(update.view);
                }
            }
            buildDecorations(view: EditorView) {
                const builder: Range<Decoration>[] = [];
                const lines = view.state.doc.toString().split("\n");
                let pos = 0;
                let previousLineBlank = true;
                for (const line of lines) {
                    const trimmed = line.trim();
                    // console.log('line', line);
                    // console.log('trimmed', trimmed);
                    if (trimmed) {
                        const isAllCaps = /^[A-Z0-9 _'-]+$/.test(trimmed);
                        if (isAllCaps) {
                            const firstWord = trimmed.split(/\s+/)[0].toUpperCase();
                            const isKnownHeader = timelineItemTypesForTyping.includes(firstWord as Uppercase<string>);
                            const isKnownCharacter = findCharacterByName(trimmed.toUpperCase());

                            if (!isKnownHeader && !isKnownCharacter && previousLineBlank) {
                                console.log('is not header or char and prv line not blank');
                                builder.push(Decoration.mark({
                                    class: "invalid-line",
                                    attributes: { title: "Unknown character or part" },
                                }).range(pos, pos + line.length));
                            }

                            previousLineBlank = false;
                        }
                    }
                    else {
                        // console.log('blank');
                        previousLineBlank = true;
                    }
                    pos += line.length + 1;
                }
                return Decoration.set(builder);
            }
        },
        { decorations: v => v.decorations }
    );

    const interactivePlugin = ViewPlugin.fromClass(
        class {
            constructor(public view: EditorView) { }
            update() { }

        },
        {
            eventHandlers: {
                dblclick(event, view) {
                    handleClick(event, view);
                }
            }
        }
    );


    const handleClick = async (event: MouseEvent, view: EditorView) => {
        saveDoc(); // since it currently resets IDs...

        const pos = view.state.selection.main.head;
        if (pos == null) return;

        const line = view.state.doc.lineAt(pos);

        const rawText = line.text;
        const offset = pos - line.from;
        const trimmed = rawText.trim();

        if (!trimmed) return;

        // Check meta tokens (# or &)
        const metaRegex = /([#^&][A-Za-z0-9_-]+)/g;
        let m;
        while ((m = metaRegex.exec(rawText))) {
            const token = m[0];
            const meta = token[0];
            const val = token.slice(1);
            const start = m.index;
            const end = start + token.length;

            if (offset >= start && offset <= end) {
                let info: { type: string; id?: string; title?: string } | null = null;

                if (meta === "#") {
                    const tag = tags[val];
                    if (tag) info = { type: "tag", id: tag.id, title: tag.title };
                }
                if (meta === "&") {
                    const note = notes[val];
                    if (note) info = { type: "note", id: note.id, title: note.title };
                }
                if (meta === "^") {
                    info = { type: "duration", id: val, title: val };
                }

                if (info) {
                    console.log("Clicked item:", info);
                    navigate(childRoute(info.type + '/' + info.id));
                    return;
                }
            }
        }

        // Map the clicked line to a timeline item ID - safe as just saved
        let lineStart = 0;
        for (const id of timelineSequence()) {
            const item = timelineItems[id];
            const text = item.renderAsText();
            const lines = text.split("[\n]{2,}");
            for (const l of lines) {
                const lineEnd = lineStart + l.length;
                if (lineStart <= pos && pos <= lineEnd) {
                    console.log("Clicked timeline item:", { type: item.type, id, text }, item);
                    if (item.type === 'location') {
                        navigate(childRoute('locations/' + item.details.ref))
                    } else {
                        navigate(childRoute('items/' + id))
                    }
                    return;
                }
                lineStart = lineEnd + 2; // +2 because of the "\n\n" join
            }
        }

        console.warn("Clicked line did not match any known item:", trimmed);
    };


    onMount(() => {
        const initialText = timelineSequence()
            .map(id => timelineItems[id].renderAsText())
            .join("\n\n");

        const state = EditorState.create({
            doc: initialText,
            extensions: [
                basicSetup,
                highlightInvalidLines,
                tooltipPlugin,
                interactivePlugin,
                history(),
                autocompletion({ override: [completionSource] }),
                EditorView.lineWrapping,
                EditorView.updateListener.of(update => { if (update.docChanged) setIsDirty(true); }),
            ],
        });

        const v = new EditorView({ state, parent: editorRef });
        setView(v);

        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
                e.preventDefault();
                saveDoc();
            }
        };
        window.addEventListener("keydown", handleKeyDown);

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty()) { e.preventDefault(); e.returnValue = ""; }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);

        onCleanup(() => {
            v.destroy();
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("beforeunload", handleBeforeUnload);
            if (isDirty()) saveDoc();
        });
    });

    async function saveDoc() {
        if (!view()) return;
        const parsed = text2timelineItemsJson(
            view()!.state.doc.toString(),
            timelineItemTypesForTyping,
            findCharacterByName,
            findLocationByName
        );
        await deleteAllTimelineItems();
        await addTimelineItems(parsed);
        await loadAll();
        setIsDirty(false);
    }

    createEffect(() => {
        console.log(location.pathname);
    });

    return (
        <>
            <nav class="right-align no-top-padding no-margin">
                <button
                    class="icon small circle"
                    disabled={!view() || undoDepth(view()!.state) === 0}
                    onClick={() => view() && undo(view()!)}>
                    <i>undo</i><div class="tooltip left">Undo</div>
                </button>
                <button
                    class="icon small circle"
                    disabled={!view() || redoDepth(view()!.state) === 0}
                    onClick={() => view() && redo(view()!)}>
                    <i>redo</i><div class="tooltip left">Redo</div>
                </button>
                <button class="icon small circle" disabled={!isDirty()} onClick={saveDoc}>
                    <i>save</i><div class="tooltip left">Save (<kbd>CTRL S</kbd>)</div>
                </button>
                <button class="icon small circle" onClick={showHelp}>
                    <i>help</i><div class="tooltip left">Help</div>
                </button>
            </nav>
            <article class={styles.typingEditor} ref={editorRef}></article>
        </>
    );
}
