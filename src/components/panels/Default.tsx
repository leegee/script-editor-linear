import { CharacterItem, TimelineLocationItem, TimelineItem } from "../CoreItems";
import { FilterList } from "../FilterList";

export default function Default() {
    return <>
        <details>
            <summary><TimelineLocationItem.ListLocationsHeader /></summary>
            <TimelineLocationItem.ListLocations />
        </details>

        <details>
            <summary><CharacterItem.ListCharactersHeaeder /></summary>
            <CharacterItem.ListCharacters />
        </details>

        <details>
            <summary><FilterList.ListFiltersHeader /></summary>
            <FilterList.ListFilters />
        </details>


    </>

}