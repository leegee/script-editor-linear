import { useNavigate, useParams } from "@solidjs/router";
import TimelineItemEditor from "../../TimelineItemEditor";
import { addNote, timelineItems, updateTimelineItemAddNote } from "../../../stores";
import { CanonicalNote } from "./CanonicalNote";
import { createSignal, createMemo } from "solid-js";
import { childRoute } from "../../../lib/routeResolver";

export default function NoteCreator() {
    const navigate = useNavigate();
    const params = useParams();

    // Local object representing the new note
    const [noteObj] = createSignal({
        title: "",
        details: { text: "" }
    });

    const item = timelineItems[params.itemId];

    const isValid = createMemo(() => {
        const t = noteObj().title?.trim();
        return t && t.length > 0;
    });

    async function createNote() {
        if (!isValid()) return;

        const note = new CanonicalNote({
            title: noteObj().title.trim(),
            details: {
                text: noteObj().details.text.trim(),
                createdAt: new Date().toISOString(),
            }
        });

        await addNote(note);
        await updateTimelineItemAddNote(params.itemId, note.id);

        navigate(childRoute("items/" + params.itemId));
    }

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

            <div class="field bottom-padding">
                <TimelineItemEditor
                    item={noteObj()}
                    path="title"
                    label="Title"
                    defaultValue=""
                />
            </div>

            <div class="field bottom-padding">
                <TimelineItemEditor
                    item={noteObj()}
                    path="details"
                    key="text"
                    multiline
                    label="Text"
                    defaultValue=""
                />
            </div>

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
