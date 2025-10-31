import { CharacterItem, TimelineLocationItem, TimelineItem } from "../CoreItems";
import { FilterList } from "../FilterList";
import PanelSectionHeader from "../PanelSectionHeader";

export default function Default() {
    return <>
        <details>
            <summary>
                <PanelSectionHeader title='Locations' icon='location_on' />
            </summary>
            <TimelineLocationItem.ListAllLocations />
        </details>

        <details>
            <summary>
                <PanelSectionHeader title='Characters' icon='people' />
            </summary>
            <CharacterItem.ListAllCharacters />
        </details>

        <details>
            <summary><FilterList.ListFiltersHeader /></summary>
            <FilterList.ListFilters />
        </details>


    </>

}