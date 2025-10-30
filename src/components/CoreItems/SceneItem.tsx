import { type JSX } from "solid-js";
import { formatHHMMSS } from "../../lib/formatSecondsToHMS";
import { characters, locations, sceneCharacters, sceneDurations, sceneLocations } from "../../stores";
import TimelineItemEditor from "../TimelineItemEditor";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";
import { TimelineLocationItem } from "./Locations/TimelineLocationItem";
import { CharacterItem } from "./CharacterItem";

export class SceneItem extends TimelineItem {
    constructor(props: Omit<TimelineItemProps, "type">) {
        super({ ...props, type: 'scene' });
    }

    renderCompact() {
        return (
            <h3 class="field">
                <TimelineItemEditor
                    id={this.id}
                    path="title"
                />
            </h3>
        );
    }


    renderFull() {
        return (
            <fieldset>
                <h3 class="field">
                    <TimelineItemEditor
                        id={this.id}
                        path="title"
                    />
                </h3>

                <article>
                    <h4>Duration: {formatHHMMSS(sceneDurations()[this.id])} </h4>
                </article>

                <article>
                    <CharacterItem.ListCharactersHeaeder />
                    <ul class="list no-space border scroll">
                        {[...(sceneCharacters()[this.id] ?? [])].map(charId => (
                            <li>{characters[charId].title}</li>
                        ))}
                    </ul>
                </article>

                <article>
                    <TimelineLocationItem.ListLocationsHeader />
                    <ul class="list no-space border scroll">
                        {[...(sceneLocations()[this.id] ?? [])].map(locId => (
                            <li>{locations[locId]?.title ?? "Unknown Location " + locId}</li>
                        ))}
                    </ul>
                </article>
            </fieldset >
        );
    }
}
