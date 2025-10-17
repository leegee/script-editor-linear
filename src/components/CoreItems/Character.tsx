export class Character {
    id!: string;
    name!: string;
    traits?: string[];
    notes?: string[];

    constructor(data: Partial<Character>) {
        Object.assign(this, data);
    }

    renderCompact() { return this.name; }
    renderFull() { return `${this.name} [${this.traits?.join(", ")}]`; }
}

export function reviveCharacter(obj: any) { return new Character(obj); }
