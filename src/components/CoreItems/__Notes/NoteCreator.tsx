import { useNavigate } from "@solidjs/router";
import NoteEditor from "../../../stores/NoteEditor";

export default function NoteCreator() {
    const navigate = useNavigate();

    return (
        <NoteEditor
            mode="new"
            onSave={() => {
                navigate(-1); // back to timeline or parent view
            }}
        />
    );
}
