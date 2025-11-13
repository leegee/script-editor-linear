import { useParams, useNavigate } from "@solidjs/router";
import TagEditor from "../CoreItems/TagEditor";
import PanelSectionHeader from "../PanelSectionHeader";

export default function AttachNewTag() {
    const navigate = useNavigate();
    const params = useParams<{ parentId: string }>();

    return (
        <>
            <PanelSectionHeader title="Add Tag" icon="new_label" />
            <TagEditor
                parentId={params.parentId}
                onSave={() => navigate(-1)}
                onDelete={() => navigate(-1)}
            />
        </>
    );
}
