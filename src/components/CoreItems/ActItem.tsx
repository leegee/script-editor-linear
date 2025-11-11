import { formatHHMMSS } from "../../lib/formatSecondsToHMS";
import { actCharacters, actDurations, actLocations, characters, locations, notes, tags, updateTimelineItem } from "../../stores";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";
import TimelineItemEditor from "../TimelineItemEditor";
import { A } from "@solidjs/router";
import PanelSectionHeader from "../PanelSectionHeader";
import { For } from "solid-js";
import { useChildRoute } from "../ChildRoute";

export class ActItem extends TimelineItem {
    constructor(props: Omit<TimelineItemProps, "type">) {
        super({ ...props, type: 'act' });
    }

    renderFull() {
        const { childRoute } = useChildRoute();

        return (
            <>
                <header>
                    <h3>
                        <TimelineItemEditor id={this.id} path="title" />
                    </h3>

                    <div class="row">
                        Duration
                        <span class="max" />
                        <code>{formatHHMMSS(actDurations()[this.id])}</code>
                    </div>

                    <div class="row">
                        {this.detailsDate()}
                    </div>

                    <div class="row">
                        {this.renderTags()}
                    </div>
                </header>

                {this.panelNotesSection()}

                <article class="no-margin">
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

                <article class="no-margin">
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

            </ >
        );
    }

    renderTags() {
        return (
            <For each={this.tags}>
                {(tag) => (
                    <>
                        <div class="chip" style={`border-width: 2pt; border-color:${tags[tag].details.clr}`}>{tags[tag].title}</div>
                    </>
                )}
            </For>
        );
    }

}
