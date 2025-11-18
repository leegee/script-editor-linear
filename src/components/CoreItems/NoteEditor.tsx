/**
 * 
 * TODO Merge into Note
 * 
 */
import styles from "./NoteEditor.module.scss";
import { createSignal, createEffect, Show, For, Match, Switch } from "solid-js";
import AutoResizingTextarea from "../AutoResizingTextarea";
import { addNote, getNote, patchNote, removeNote, timelineItems, updateTimelineItem } from "../../stores";
import { showAlert } from "../../stores/modals";
import { Note } from "./Note";

interface NoteEditorProps {
    noteId?: string;
    parentId?: string;
    onSave?: (note: Note | undefined) => void;
    onDelete?: (noteId: string) => void;
}

export default function NoteEditor(props: NoteEditorProps) {
    const existingNote = props.noteId ? getNote(props.noteId) : undefined;
    const [note, setNote] = createSignal<Note | undefined>(existingNote);

    // Local signals for editing
    const [title, setTitle] = createSignal(existingNote?.title ?? "");
    const [text, setText] = createSignal(existingNote?.details?.text ?? "");
    const [urls, setUrls] = createSignal<string[]>(existingNote?.details?.urls ?? []);
    const [editingUrl, setEditingUrl] = createSignal(-1);

    // Sync signals when note changes
    createEffect(() => {
        const id = props.noteId;
        const n = id ? getNote(id) : undefined;
        setNote(n);
        setTitle(n?.title ?? "");
        setText(n?.details?.text ?? "");
        setUrls(n?.details?.urls ?? []);
        setEditingUrl(-1); // reset editing
    });

    const handleSave = () => {
        if (!title()) {
            showAlert('Notes must have at least a title.')
            return;
        }

        let savedNote: Note;
        if (!note()) {
            // Create new note
            savedNote = addNote({
                title: title(),
                details: { text: text(), urls: urls() },
            });
            setNote(savedNote);

            // Attach to parent if given
            if (props.parentId) {
                const parent = timelineItems[props.parentId];
                if (parent) {
                    parent.notes.push(savedNote.id);
                    updateTimelineItem(parent.id, "notes", "", parent.notes);
                }
            }
        } else {
            // Patch existing
            savedNote = note()!;
            patchNote(savedNote.id, {
                title: title(),
                details: { text: text(), urls: urls() },
            });
        }

        if (props.onSave) props.onSave(savedNote);
    };

    const handleDelete = () => {
        const id = note()?.id;
        if (!id) return;

        // Remove from every TimelineItem containing this note
        Object.values(timelineItems).forEach(item => {
            if (item.notes.includes(id)) {
                item.notes = item.notes.filter(nid => nid !== id);
                updateTimelineItem(item.id, "notes", "", item.notes);
            }
        });

        removeNote(id);
        setNote(undefined);

        if (props.onDelete) props.onDelete(id);
        if (props.onSave) props.onSave(undefined);
    };

    const addUrl = () => {
        setUrls([...urls(), ""]);
        setEditingUrl(urls().length - 1);
    }

    const updateUrl = (idx: number, value: string) => {
        const copy = [...urls()];
        copy[idx] = value;
        setUrls(copy);
    };

    const removeUrl = (idx: number) => {
        const copy = [...urls()];
        copy.splice(idx, 1);
        setUrls(copy);
        setEditingUrl(-1);
    };

    return (
        <article class={styles.noteEditor}>
            <div class="field label max border">
                <input
                    type="text"
                    value={title()}
                    onInput={(e) => setTitle(e.currentTarget.value)}
                />
                <label>Title</label>
            </div>

            <div class="field label textarea">
                <AutoResizingTextarea
                    value={text()}
                    onInput={(v) => setText(v)}
                    minHeight={50}
                    maxHeight={300}
                />
            </div>

            <fieldset>
                <legend>URLs</legend>
                <For each={urls()}>
                    {(url, i) => {
                        const idx = i();

                        return (
                            <>
                                <Show when={editingUrl() === idx}>
                                    <nav class="no-space">
                                        <div class="max field border">
                                            <input
                                                type="text"
                                                value={url}
                                                onBlur={(e) => updateUrl(idx, e.currentTarget.value)}
                                            />
                                        </div>
                                        <div class="right-align">
                                            <button
                                                class="chip transparent tiny no-padding"
                                                onClick={() => setEditingUrl(-1)}
                                            >
                                                <i class="tiny">check_small</i>
                                            </button>
                                        </div>
                                    </nav>
                                </Show>

                                <Show when={editingUrl() !== idx}>
                                    <div class={"row " + styles.linkEditorRoot}
                                        innerHTML={Note.urlForInnerHtml(url, urls().length === 1 ? "large-panel-img" : "extra")}
                                    >
                                        <div class={"fill small-opacity " + styles.linkEditor}>
                                            <button class="transparent chip small">
                                                <a href={url} target="_blank">
                                                    <i>zoom_in</i>
                                                </a>
                                            </button>
                                            <button class="chip transparent small" onClick={() => setEditingUrl(idx)} >
                                                <i>edit</i>
                                            </button>
                                            <button class="chip transparent small" onClick={() => removeUrl(idx)} >
                                                <i>delete</i>
                                            </button>
                                        </div>
                                    </div>
                                </Show>
                            </>
                        );
                    }}
                </For>

                <div class="space"></div>

                <div class="right-align">
                    <button class="chip small" onClick={addUrl} disabled={editingUrl() > -1}>
                        <i>add</i>Add URL
                    </button>
                </div>
            </fieldset>

            <div class="space"></div>

            <footer class="top-padding extra-padding">
                <button class="button" onClick={handleSave} disabled={!title()}>
                    <i>save</i>
                    <span>Save</span>
                </button>
                <Show when={note()?.id}>
                    <button class="transparent" onClick={handleDelete}>
                        <i>delete</i>
                        <span>Delete all occurances</span>
                    </button>
                </Show>
            </footer>
        </article >
    );
}
