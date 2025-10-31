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
                        <code>{formatHHMMSS(actDurations()[this.id])}</code>
                    </div>
                </header>

                <article>
                    <details>
                        <summary>
                            <PanelSectionHeader title='Notes' icon='note_stack' badge={this.notes.length} />
                        </summary>
                        <ul class="list no-space border scroll">
                            {[...(this.notes ?? [])].map(noteId => (
                                <li>
                                    <A href={childRoute("/notes/" + noteId)}>
                                        {notes[noteId].title}
                                    </A>
                                </li>
                            ))}
                        </ul>
                    </details>
                </article>

                <article>
                    <PanelSectionHeader title='Characters' icon='people' badge={Object.keys(sceneCharacters()).length} />
                    <ul class="list no-space border scroll">
                        {[...(sceneCharacters()[this.id] ?? [])].map(charId => (
                            <li>{characters[charId].title}</li>
                        ))}
                    </ul>
                </article>

                <article>
                    <PanelSectionHeader title='Locations' icon='location_on' badge={Object.keys(sceneLocations()).length} />
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
