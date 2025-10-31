import { useNavigate, useParams } from "@solidjs/router";
import { CanonicalNote } from "./CanonicalNote";
import { addNote, updateTimelineItemAddNote, timelineItems } from "../../../stores";
import { createSignal, createMemo, JSX } from "solid-js";
import { childRoute } from "../../../lib/routeResolver";

export default function NoteCreator() {
    const navigate = useNavigate();
    const params = useParams();

    // Local object representing the new note
    const [noteObj, setNoteObj] = createSignal({
        title: "New note",
        details: { text: "" }
    });

    const item = timelineItems[params.itemId];

    const isValid = createMemo(() => {
        const t = noteObj().title?.trim();
        return t && t.length > 0;
    });

    async function createNote() {
        if (!isValid()) return;

        const note = new CanonicalNote(noteObj());

        await addNote(note);
        await updateTimelineItemAddNote(params.itemId, note.id);

        navigate(childRoute("items/" + params.itemId));
    }

    const renderEditors = (): JSX.Element => {
        const noteInstance = new CanonicalNote(noteObj());
        return noteInstance.renderFull();
    };

    return (
        <article>
            <header>
                <h2>Create Note</h2>
            </header>

            <div>
                <p>
                    Adding a note to <code>{item.type}</code>
                    {item.title ? ` "${item.title}."` : '."'}
                </p>
            </div>

            {/* Reuse mixin renderFull */}
            {renderEditors()}

            <div class="row right-align top-padding">
                <button class="transparent" onClick={() => navigate(-1)}>
                    Cancel
                </button>

                <button
                    class="primary"
                    disabled={!isValid()}
                    onClick={createNote}
                >
                    Create Note
                </button>
            </div>
        </article>
    );
}
