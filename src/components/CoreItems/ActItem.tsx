import { formatHHMMSS } from "../../lib/formatSecondsToHMS";
import { actCharacters, actDurations, actLocations, characters, locations, notes } from "../../stores";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";
import TimelineItemEditor from "../TimelineItemEditor";
import { A } from "@solidjs/router";
import { childRoute } from "../../lib/routeResolver";

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
                <h3 class="field">
                    <TimelineItemEditor
                        id={this.id}
                        path="title"
                    />
                </h3>

                <div class="field">
                    Duration {formatHHMMSS(actDurations()[this.id])}
                </div>

                <article>
                    <details>
                        <summary>
                            <h4>Notes</h4>
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
                    <details>
                        <summary>
                            <h4>Characters in this act</h4>
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
                            <h4>Locations in this act</h4>
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
