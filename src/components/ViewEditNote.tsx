// src/pages/ViewEditNote.tsx
import { useParams, useNavigate } from "@solidjs/router";
import NoteEditor from "./CoreItems/NoteEditor";

export default function ViewEditNote() {
    const params = useParams<{ id: string }>();
    const navigate = useNavigate();

    return (
        <div>
            <h2>Edit Note</h2>
            <NoteEditor
                noteId={params.id}
                onSave={() => navigate(-1)}
                onDelete={() => navigate(-1)}
            />
        </div>
    );
}
