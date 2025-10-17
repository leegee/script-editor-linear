export class Tag {
    id!: string;
    name!: string;
    color?: string;
    notes?: string[];

    constructor(data: Partial<Tag>) {
        Object.assign(this, data);
    }

    renderCompact() { return this.name; }
}

export function reviveTag(obj: any) { return new Tag(obj); }
