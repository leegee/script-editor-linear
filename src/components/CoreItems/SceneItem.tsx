import { type JSX } from "solid-js";
import { formatHHMMSS } from "../../lib/formatSecondsToHMS";
import { actDurations, characters, locations, notes, sceneCharacters, sceneDurations, sceneLocations } from "../../stores";
import TimelineItemEditor from "../TimelineItemEditor";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";
import { TimelineLocationItem } from "./Locations/TimelineLocationItem";
import { CharacterItem } from "./CharacterItem";
import { A } from "@solidjs/router";
import { childRoute } from "../../lib/routeResolver";
import { TimelineNoteItem } from "./Notes/TimelineNoteItem";
import PanelSectionHeader from "../PanelSectionHeader";

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
                <header>
                    <h3>
                        <TimelineItemEditor
                            id={this.id}
                            path="title"
                        />
                    </h3>
                    <div class="row">
                        Duration
                        <span class="max" />
                        <code>{formatHHMMSS(sceneDurations()[this.id])}</code>
                    </div>
                </header>

                {this.panelNotesSection()}

                <article>
                    <details>
                        <summary>
                            <PanelSectionHeader title='Locations' icon='location_on' badge={(sceneLocations()[this.id]).size} />
                        </summary>
                        <ul class="list no-space border scroll">
                            {[...(sceneLocations()[this.id] ?? [])].map(locId => (
                                <li>{locations[locId]?.title ?? "Unknown Location " + locId}</li>
                            ))}
                        </ul>
                    </details>
                </article>

                <article>
                    <details>
                        <summary>
                            <PanelSectionHeader title='Characters' icon='people' badge={(sceneCharacters()[this.id]).size} />
                        </summary>
                        <ul class="list no-space border scroll">
                            {[...(sceneCharacters()[this.id] ?? [])].map(charId => (
                                <li>{characters[charId].title}</li>
                            ))}
                        </ul>
                    </details>
                </article>
            </fieldset >
        );
    }
}
