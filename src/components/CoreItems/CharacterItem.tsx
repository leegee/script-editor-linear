import { For } from "solid-js";
import { characters } from "../../stores";
import { TimelineItem } from "./TimelineItem";
import { A } from "@solidjs/router";

export class CharacterItem extends TimelineItem {
    name!: string;
    traits?: string[];

    static revive(obj: any) {
        return new CharacterItem(obj);
    }

    constructor(props: { id: string; name: string; traits?: string[] }) {
        super({
            ...props,
            type: 'character'
        });
        this.name = props.name;
        this.traits = props.traits;
    }

    renderCompact() { return this.name; }
    renderFull() { return `${this.name} [${this.traits?.join(", ")}]`; }
}

export function ListCharacters() {
    return <fieldset>
        <h2>Characters</h2>
        <ul class="list border no-space">
            <For each={Object.values(characters)}>
                {(loc) => (
                    <li>
                        <A href={"/character/" + loc.id}>{loc.name}</A>
                    </li>
                )}
            </For>
        </ul>
    </fieldset>
}
