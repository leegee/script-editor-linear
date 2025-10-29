import { useNavigate, useParams } from "@solidjs/router";
import AutoResizingTextarea from "../../AutoResizingTextarea";
import { addNote, timelineItems, updateTimelineItemAddNote } from "../../../stores";
import { CanonicalNote } from "./CanonicalNote";
import { createSignal, createMemo } from "solid-js";
import { childRoute } from "../../../lib/routeResolver";

export default function NoteCreator() {
    const navigate = useNavigate();
    const params = useParams();

    const [title, setTitle] = createSignal("");
    const [text, setText] = createSignal("");

    const item = timelineItems[params.itemId];

    const isValid = createMemo(() => {
        const t = title().trim();
        return t.length > 0;
    });

    async function createNote() {
        if (!isValid()) return;

        const note = new CanonicalNote({
            title: title().trim(),
            details: {
                text: text().trim(),
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
                    Adding a note to <code>{item.type}</code>{
                        item.title ? ('"' + item.title + '."') : '."'
                    }
                </p>
            </div>

            <div class="field bottom-padding">
                <input
                    type="text"
                    pattern="^\S+.*\S$"
                    value={title()}
                    onBlur={(e) => setTitle(e.currentTarget.value)}
                    placeholder="Enter title"
                />
                <label>Title</label>
            </div>

            <AutoResizingTextarea
                label="Text"
                value={text()}
                onBlur={(value) => setText(value)}
            />

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
