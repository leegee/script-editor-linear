// src/pages/ViewEditNote.tsx
import { useParams, useNavigate } from "@solidjs/router";
import PanelSectionHeader from "./PanelSectionHeader";
import TagEditor from "./CoreItems/TagEditor";
import { TagList } from "./TagList";

export default function ViewEditTag() {
    const params = useParams<{ id: string }>();
    const navigate = useNavigate();

    return (
        <>
            <PanelSectionHeader title="Tag" icon="tag" />

            <TagEditor
                tagId={params.id}
                onSave={() => navigate(-1)}
                onDelete={() => navigate(-1)}
            />

            <fieldset>
                <legend>Occurances</legend>
                <TagList.ListTags id={params.id} />
            </fieldset>
        </>
    );
}
