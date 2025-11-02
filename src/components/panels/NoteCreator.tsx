import { useParams, useNavigate } from "@solidjs/router";
import { getTimelineItem, NoteType, updateTimelineItem } from "../../stores";
import NoteEditor from "../CoreItems/NoteEditor";
import PanelSectionHeader from "../PanelSectionHeader";

export default function AttachNewNote() {
    const params = useParams<{ itemId: string }>();
    const navigate = useNavigate();

    const parentItem = getTimelineItem(params.itemId);

    const handleSave = (note: NoteType | undefined) => {
        if (note && parentItem) {
            // attach note ID to parent TimelineItem
            parentItem.notes.push(note.id);
            updateTimelineItem(parentItem.id, 'notes', '', parentItem.notes);
        }
        navigate(-1);
    };

    return (
        <>
            <PanelSectionHeader title="Add Note" icon="note_add" />
            <NoteEditor
                parentId={params.itemId}
                onSave={handleSave}
            />
        </>
    );
}
