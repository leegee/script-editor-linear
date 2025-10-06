export abstract class ScriptItem {
    readonly id: string;
    readonly time: number;
    readonly type: string;
    text: string;

    constructor(id: string, time: number, type: string, text: string) {
        this.id = id;
        this.time = time;
        this.type = type;
        this.text = text;
    }

    abstract render(): string;

    toJSON() {
        return {
            id: this.id,
            time: this.time,
            type: this.type,
            text: this.text,
        };
    }
}

