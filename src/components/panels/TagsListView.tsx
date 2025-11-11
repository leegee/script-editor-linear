import PanelSectionHeader from "../PanelSectionHeader";
import { TagList } from "../TagList";

export default function SettingsView() {
    return (
        <article class="border">
            <PanelSectionHeader title='Tags' icon='label' />
            <TagList.ListTags />
        </article>
    );
}
