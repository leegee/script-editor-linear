// src/pages/ViewEditNote.tsx
import { useParams, useNavigate } from "@solidjs/router";
import PanelSectionHeader from "./PanelSectionHeader";
import TagEditor from "./CoreItems/TagEditor";
import { Tag } from "./CoreItems";
import { createMemo } from "solid-js";

export default function ViewEditTag() {
    const navigate = useNavigate();
    const params = useParams<{ id: string }>();
    const tagId = createMemo(() => params.id);

    return (
        <>
            <PanelSectionHeader title="Tag" icon="tag" />

            <TagEditor
                tagId={tagId()}
                onSave={() => navigate(-1)}
                onDelete={() => navigate(-1)}
            />

            <fieldset>
                <legend>Occurances</legend>
                <Tag.ListTags id={params.id} />
            </fieldset>
        </>
    );
}
