import { createMemo } from "solid-js";
import { useParams } from "@solidjs/router";
import { notes } from "../../stores";
import PanelSectionHeader from "../PanelSectionHeader";
import { TimelineNoteItem } from "../CoreItems/__Notes/TimelineNoteItem";

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
