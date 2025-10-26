import { type JSX } from "solid-js";
import { formatHHMMSS } from "../../lib/formatSecondsToHMS";
import { characters, locations, sceneCharacters, sceneDurations, sceneLocations } from "../../stores";
import TimelineItemEditor from "../ItemEditor";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";

export class SceneItem extends TimelineItem {
    constructor(props: Omit<TimelineItemProps, "type">) {
        super({ ...props, type: 'scene' });
    }

    renderCompact() {
        return (
            <h3 class="timeline-item">
                <TimelineItemEditor
                    id={this.id}
                    path="title"
                    defaultValue={this.title ?? "Untitled Scene"}
                />
            </h3>
        );
    }


    renderFull() {
        return (
            <fieldset>
                <h3>
                    <TimelineItemEditor
                        id={this.id}
                        path="title"
                        defaultValue={this.title ?? "Untitled Scene"}
                    />
                </h3>

                <article>
                    <h4>Duration: {formatHHMMSS(sceneDurations()[this.id])} </h4>
                </article>

                <article>
                    <h4>Characters in this scene:</h4>
                    <ul class="list no-space border scroll">
                        {[...(sceneCharacters()[this.id] ?? [])].map(charId => (
                            <li>{characters[charId].title}</li>
                        ))}
                    </ul>
                </article>

                <article>
                    <h4>Locations in this scene:</h4>
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
