import { ScriptItem } from "./ScriptItem";

export class Dialogue extends ScriptItem {
    speaker: string;

    constructor(id: string, time: number, speaker: string, text: string) {
        super(id, time, 'dialogue', text);
        this.speaker = speaker;
    }

    render() {
        return `${this.speaker}: ${this.text}`;
    }

    toJSON() {
        return { ...super.toJSON(), speaker: this.speaker };
    }
}
