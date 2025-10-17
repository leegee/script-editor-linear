export class Note {
    id!: string;
    parentId!: string;
    parentType!: string;
    text!: string;
    media?: string[];

    constructor(data: Partial<Note>) {
        Object.assign(this, data);
    }

    renderCompact() { return this.text; }
}

export function reviveNote(obj: any) { return new Note(obj); }
