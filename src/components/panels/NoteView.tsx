import { createMemo } from "solid-js";
import { useParams } from "@solidjs/router";
import { notes } from "../../stores";
import { TimelineNoteItem } from "../CoreItems";

export default function NoteView() {
    const params = useParams();

    const item = createMemo(() => notes[params.id]);

    return <div>
        {item()?.renderFull() ?? (
            <article class="border">
                <TimelineNoteItem.ListNotesHeader />
                <TimelineNoteItem.ListNotes />
            </article>
        )}
    </div>
}
