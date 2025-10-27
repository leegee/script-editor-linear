import { CharacterItem, TimelineLocationItem, TimelineItem } from "../CoreItems";
import FilterList from "../FilterList";

export default function Default() {
    return <>
        <TimelineLocationItem.ListLocations />
        <CharacterItem.ListCharacters />
        <FilterList />
    </>

}