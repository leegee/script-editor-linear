import { CharacterItem, TimelineLocationItem, TimelineItem } from "../CoreItems";

export default function Default() {
    return <>
        <TimelineLocationItem.ListLocations />
        <CharacterItem.ListCharacters />
    </>

}