import { For } from "solid-js";
import { characters, setTimelineItems } from "../../stores";
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
        return <fieldset>
            <h2>Characters</h2>
            <ul class="list border no-space">
                <For each={Object.values(characters)}>
                    {(chr) => (
                        <li>
                            <A href={"/character/" + chr.id}>{chr.title}</A>
                        </li>
                    )}
                </For>
            </ul>
        </fieldset>
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

