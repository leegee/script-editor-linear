// src/pages/ViewEditNote.tsx
import { useParams, useNavigate } from "@solidjs/router";
import NoteEditor from "./CoreItems/NoteEditor";
import PanelSectionHeader from "./PanelSectionHeader";

export default function ViewEditNote() {
    const params = useParams<{ id: string }>();
    const navigate = useNavigate();

    return (
        <>
            <PanelSectionHeader title="Note" icon="note" />

            <NoteEditor
                noteId={params.id}
                onSave={() => navigate(-1)}
                onDelete={() => navigate(-1)}
            />
        </>
    );
}
