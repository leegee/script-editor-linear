import { createSignal, createEffect, Show, For } from "solid-js";
import AutoResizingTextarea from "../AutoResizingTextarea";
import { createNote, getNote, NoteType, patchNote, removeNote, timelineItems, updateTimelineItem } from "../../stores";

interface NoteEditorProps {
    noteId?: string;
    parentId?: string;
    onSave?: (note: NoteType | undefined) => void;
    onDelete?: (noteId: string) => void;
}

export default function NoteEditor(props: NoteEditorProps) {
    const existingNote = props.noteId ? getNote(props.noteId) : undefined;
    const [note, setNote] = createSignal<NoteType | undefined>(existingNote);

    // Local signals for editing
    const [title, setTitle] = createSignal(existingNote?.title ?? "");
    const [text, setText] = createSignal(existingNote?.details?.text ?? "");
    const [urls, setUrls] = createSignal<string[]>(existingNote?.details?.urls ?? []);

    // Sync signals when note changes
    createEffect(() => {
        const n = note();
        if (!n) return;
        setTitle(n.title);
        setText(n.details?.text ?? "");
        setUrls(n.details?.urls ?? []);
    });

    const handleSave = () => {
        let savedNote: NoteType;
        if (!note()) {
            // Create new note
            savedNote = createNote({
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

        // Remove from parent TimelineItem if parentId supplied
        // if (props.parentId) {
        //     const parent = timelineItems[props.parentId];
        //     if (parent) {
        //         parent.notes = parent.notes.filter(nid => nid !== id);
        //         updateTimelineItem(parent.id, "notes", "", parent.notes);
        //     }
        // }

        // Remove from any TimelineItem containing this note
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

    const addUrl = () => setUrls([...urls(), ""]);
    const updateUrl = (idx: number, value: string) => {
        const copy = [...urls()];
        copy[idx] = value;
        setUrls(copy);
    };
    const removeUrl = (idx: number) => {
        const copy = [...urls()];
        copy.splice(idx, 1);
        setUrls(copy);
    };

    return (
        <article class="note-editor">
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
                    label="Note"
                    value={text()}
                    onInput={(v) => setText(v)}
                    minHeight={50}
                    maxHeight={300}
                />
            </div>


            <fieldset>
                <legend>URLs</legend>
                <For each={urls()}>
                    {(url, idx) => (
                        <nav class="no-space">
                            <div class="max field">
                                <input
                                    type="text"
                                    value={url}
                                    onBlur={(e) => updateUrl(idx(), e.currentTarget.value)}
                                />
                            </div>
                            <button class="circle transparent small" onClick={() => removeUrl(idx())}><i>delete</i></button>
                        </nav>
                    )}
                </For>

                <div class="space"></div>

                <div class="right-align">
                    <button class="chip small" onClick={addUrl}><i>add</i>Add URL</button>
                </div>
            </fieldset>

            <div class="space"></div>

            <footer class="top-padding extra-padding">
                <button class="button" onClick={handleSave}>
                    <i>save</i>
                    <span>Save</span>
                </button>
                <Show when={note()?.id}>
                    <button class="transparent" onClick={handleDelete}>
                        <i>delete</i>
                        <span>Delete</span>
                    </button>
                </Show>
            </footer>
        </article>
    );
}
