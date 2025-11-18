import { useParams, useNavigate } from "@solidjs/router";
import NoteEditor from "./CoreItems/NoteEditor";
import PanelSectionHeader from "./PanelSectionHeader";
import { createMemo } from "solid-js";

export default function ViewEditNote() {
    const params = useParams<{ id: string }>();
    const navigate = useNavigate();
    const noteId = createMemo(() => params.id);

    return (
        <>
            <PanelSectionHeader title="Note" icon="note" />

            <NoteEditor
                noteId={noteId()}
                onSave={() => navigate(-1)}
                onDelete={() => navigate(-1)}
            />
        </>
    );
}
