import { FilterList, filtersActiveCount } from "../FilterList";
import PanelSectionHeader from "../PanelSectionHeader";

export default function SettingsView() {
    return (
        <article class="border">
            <PanelSectionHeader title='Filters' icon='filter_alt' badge={filtersActiveCount()} />
            <FilterList.ListFilters />
        </article>

    );
}
