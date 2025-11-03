import { useParams, useNavigate } from "@solidjs/router";
import NoteEditor from "../CoreItems/NoteEditor";
import PanelSectionHeader from "../PanelSectionHeader";

export default function AttachNewNote() {
    const navigate = useNavigate();
    const params = useParams<{ itemId: string }>();

    return (
        <>
            <PanelSectionHeader title="Add Note" icon="note_add" />
            <NoteEditor parentId={params.itemId}
                onSave={() => navigate(-1)}
                onDelete={() => navigate(-1)}
            />
        </>
    );
}
