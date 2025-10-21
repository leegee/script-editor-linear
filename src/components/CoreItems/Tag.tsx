export class Tag {
    id!: string;
    title!: string;
    color?: string;
    notes?: string[];

    constructor(data: Partial<Tag>) {
        Object.assign(this, data);
    }

    renderCompact() { return this.title; }
}

export function reviveTag(obj: any) { return new Tag(obj); }
