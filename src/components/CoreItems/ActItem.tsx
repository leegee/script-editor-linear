import { formatHHMMSS } from "../../lib/formatSecondsToHMS";
import { actCharacters, actDurations, actLocations, characters, locations, notes } from "../../stores";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";
import TimelineItemEditor from "../TimelineItemEditor";
import { A } from "@solidjs/router";
import { childRoute } from "../../lib/routeResolver";
import { CharacterItem } from "./CharacterItem";
import { TimelineLocationItem } from "./Locations/TimelineLocationItem";
import { TimelineNoteItem } from "./Notes/TimelineNoteItem";

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
                    <div class="row">
                        Duration
                        <span class="max" />
                        <code>{formatHHMMSS(actDurations()[this.id])}</code>
                    </div>
                </header>

                <article>
                    <details>
                        <summary>
                            <TimelineNoteItem.ListNotesHeader />
                        </summary>
                        <ul class="list no-space border scroll">
                            <li class="row middle-align">
                                <A href={childRoute('/attach-new/note/' + this.id)} class="chip small transparent">
                                    <i>add</i>
                                    <span>Add note</span>
                                </A>
                            </li>
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
                    <details>
                        <summary>
                            <CharacterItem.ListCharactersHeaeder />
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

                <article>
                    <details>
                        <summary>
                            <TimelineLocationItem.ListLocationsHeader />
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

            </fieldset>
        );
    }

}
