import { formatHHMMSS } from "../../lib/formatSecondsToHMS";
import { actCharacters, actDurations, actLocations, characters, locations } from "../../stores";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";
import TimelineItemEditor from "../TimelineItemEditor";

export class ActItem extends TimelineItem {
    constructor(props: Omit<TimelineItemProps, "type">) {
        super({ ...props, type: 'act' });
    }

    renderCompact() {
        return (
            <h2 class="timeline-item">
                <TimelineItemEditor
                    id={this.id}
                    path="title"
                    defaultValue={this.title ?? "Untitled Act"}
                />
            </h2>
        );
    }

    renderFull() {
        return (
            <fieldset>
                <h3 class="field">
                    <TimelineItemEditor
                        id={this.id}
                        path="title"
                        defaultValue={this.title ?? "Untitled Act"}
                    />
                </h3>

                <article class="field">
                    <p>Duration {
                        formatHHMMSS(
                            actDurations()[this.id]
                        )

                    }</p>
                </article>

                <article>
                    <h4>Characters in this act:</h4>
                    <ul class="list no-space border scroll">
                        {[...(actCharacters()[this.id] ?? [])].map(charId => (
                            <li>{characters[charId].title}</li>
                        ))}
                    </ul>
                </article>

                <article>
                    <h4>Locations in this act:</h4>
                    <ul class="list no-space border scroll">
                        {[...(actLocations()[this.id] ?? [])].map(locId => (
                            <li>{locations[locId]?.title ?? "Unknown Location " + locId}</li>
                        ))}
                    </ul>
                </article>

            </fieldset>
        );
    }

}
