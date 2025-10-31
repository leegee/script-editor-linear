import { createMemo } from "solid-js";
import { useParams } from "@solidjs/router";
import { notes } from "../../stores";
import { TimelineNoteItem } from "../CoreItems";
import PanelSectionHeader from "../PanelSectionHeader";

export default function NoteView() {
    const params = useParams();

    const item = createMemo(() => notes[params.id]);

    return <div>
        {item()?.renderFull() ?? (
            <article class="border">
                <PanelSectionHeader title='Notes' icon='note_stack' />
                <TimelineNoteItem.ListAllNotes />
            </article>
        )}
    </div>
}
