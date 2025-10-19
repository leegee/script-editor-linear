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
