import { ScriptItem } from "./ScriptItem";

export class Act extends ScriptItem {
    title: string;

    constructor(id: string, time: number, title: string) {
        super(id, time, 'act', title);
        this.title = title;
    }

    render() {
        return `=== ${this.title.toUpperCase()} ===`;
    }

    toJSON() {
        return { ...super.toJSON(), title: this.title };
    }
}

