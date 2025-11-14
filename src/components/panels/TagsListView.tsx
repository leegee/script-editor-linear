import { Tag } from "../CoreItems";
import PanelSectionHeader from "../PanelSectionHeader";

export default function SettingsView() {
    return (
        <article class="border">
            <PanelSectionHeader title='Tags' icon='label' />
            <Tag.ListTags />
        </article>
    );
}
