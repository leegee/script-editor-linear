import { FilterList } from "../FilterList";

export default function SettingsView() {
    return (
        <article class="border">
            <FilterList.ListFiltersHeader />
            <FilterList.ListFilters />
        </article>

    );
}
