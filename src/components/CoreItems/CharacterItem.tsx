import { For } from "solid-js";
import { characters, locations, setTimelineItems } from "../../stores";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";
import { A } from "@solidjs/router";
import InlineEditable from "../InlineEditable";

export class CharacterItem extends TimelineItem {
    declare title: string;
    traits?: string[];

    static revive(obj: any) {
        return new CharacterItem(obj);
    }

    static ListCharacters() {
        return (
            <article class="border">
                <div class="responsive scroll surface">
                    <table>
                        <thead class="fixed">
                            <tr>
                                <th class="no-border">
                                    <header class="no-padding">
                                        <nav>
                                            <h2 class="max"> Locations </h2>
                                            <i>location_on</i>
                                        </nav>
                                    </header>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <For each={Object.values(characters)}>
                                {(chr) => (
                                    <tr>
                                        <td>
                                            <A href={"/character/" + chr.id}>{chr.title}</A>
                                        </td>
                                    </tr>
                                )}
                            </For>
                        </tbody>
                    </table>
                </div>
            </article>
        );
    }

    constructor(props: Omit<TimelineItemProps, "type"> & { traits?: string[] }) {
        super({
            ...props,
            type: 'character'
        });
        this.traits = props.traits;
    }

    renderCompact() { return this.title; }

    renderFull() {
        return <article>
            <h4>
                <InlineEditable
                    value={this.title}
                    onUpdate={(v) => setTimelineItems(this.title, "title", v)}
                />
            </h4>
        </article>;
    }
}

