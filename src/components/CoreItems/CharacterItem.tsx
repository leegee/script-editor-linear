import { For } from "solid-js";
import { characters } from "../../stores";
import { TimelineItem } from "./TimelineItem";

export class CharacterItem extends TimelineItem {
    name!: string;
    traits?: string[];

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


export function reviveCharacter(obj: any) { return new CharacterItem(obj); }

export function ListCharacters() {
    return <fieldset>
        <h2>Characters</h2>
        <ul class="list border no-space">
            <For each={Object.values(characters)}>
                {(loc) => (
                    <li>
                        {loc.name}
                    </li>
                )}
            </For>
        </ul>
    </fieldset>
}
