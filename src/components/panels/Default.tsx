import { characters, locations } from "../../stores";
import { CharacterItem, TimelineLocationItem, TimelineItem } from "../CoreItems";
import { FilterList, filtersActiveCount } from "../FilterList";
import PanelSectionHeader from "../PanelSectionHeader";

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


    </>

}