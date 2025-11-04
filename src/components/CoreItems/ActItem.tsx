import { formatHHMMSS } from "../../lib/formatSecondsToHMS";
import { actCharacters, actDurations, actLocations, characters, locations, notes, updateTimelineItem } from "../../stores";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";
import TimelineItemEditor from "../TimelineItemEditor";
import { A } from "@solidjs/router";
import { childRoute } from "../../lib/routeResolver";
import PanelSectionHeader from "../PanelSectionHeader";

export class ActItem extends TimelineItem {
    constructor(props: Omit<TimelineItemProps, "type">) {
        super({ ...props, type: 'act' });
    }

    renderCompact() {
        return (
            <h2 class="field">
                <TimelineItemEditor
                    id={this.id}
                    path="title"
                />
            </h2>
        );
    }

    renderFull() {
        return (
            <fieldset>
                <header>
                    <h3>
                        <TimelineItemEditor
                            id={this.id}
                            path="title"
                        />
                    </h3>
                </header>

                <article>
                    <div class="row">
                        Duration
                        <span class="max" />
                        <code>{formatHHMMSS(actDurations()[this.id])}</code>
                    </div>

                    <div class="row">
                        {this.detailsDate()}
                    </div>
                </article>

                {this.panelNotesSection()}

                <article>
                    <details>
                        <summary>
                            <PanelSectionHeader title='Locations' icon='location_on' badge={(actLocations()[this.id]).size} />
                        </summary>
                        <ul class="list no-space border scroll">
                            {[...(actLocations()[this.id] ?? [])].map(locId => (
                                <li>
                                    <A href={childRoute("/locations/" + locId)}>
                                        {locations[locId]?.title ?? "Unknown Location " + locId}
                                    </A>
                                </li>
                            ))}
                        </ul>
                    </details>
                </article>

                <article>
                    <details>
                        <summary>
                            <PanelSectionHeader title='Characters' icon='people' badge={(actCharacters()[this.id]).size} />
                        </summary>
                        <ul class="list no-space border scroll">
                            {[...(actCharacters()[this.id] ?? [])].map(charId => (
                                <li>
                                    <A href={childRoute("/characters/" + charId)}>
                                        {characters[charId].title}
                                    </A>
                                </li>
                            ))}
                        </ul>
                    </details>
                </article>

            </fieldset>
        );
    }

}
