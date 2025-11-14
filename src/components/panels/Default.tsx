import { characters, locations, tags } from "../../stores";
import { CharacterItem, TimelineLocationItem } from "../CoreItems";
import { FilterList, filtersActiveCount } from "../FilterList";
import PanelSectionHeader from "../PanelSectionHeader";
import { TagList } from "../TagList";

export default function Default() {
    return <>
        <details>
            <summary>
                <PanelSectionHeader title='Locations' icon='location_on' badge={Object.keys(locations).length} />
            </summary>
            <TimelineLocationItem.ListAllLocations />
        </details>

        <details>
            <summary>
                <PanelSectionHeader title='Characters' icon='people' badge={Object.keys(characters).length} />
            </summary>
            <CharacterItem.ListAllCharacters />
        </details>

        <details>
            <summary>
                <PanelSectionHeader title='Filters' icon='filter_alt' badge={filtersActiveCount()} />
            </summary>
            <FilterList.ListFilters />
        </details>

        <details>
            <summary>
                <PanelSectionHeader title='Tags' icon='label' badge={Object.keys(tags).length} />
            </summary>
            <TagList.ListTags />
        </details>

    </>

}