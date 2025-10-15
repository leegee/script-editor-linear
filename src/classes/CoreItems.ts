import { characters, locations } from "../stores";

export interface ScriptItemProps {
    id: string;
    type: string; // "dialogue" | "location" | "transition" | "beat-marker" | "scene" | "act"
    title?: string;
    startTime?: number;    // in seconds
    duration?: number;     // in seconds
    details?: Record<string, any>; // e.g., characterId, lat/lng, cues
    tags?: string[];
    notes?: string[];
}

export class ScriptItem {
    id: string;
    type: string;
    title?: string;
    startTime?: number;
    duration?: number;
    details: Record<string, any>;
    tags: string[];
    notes: string[];

    constructor(props: ScriptItemProps) {
        this.id = props.id;
        this.type = props.type;
        this.title = props.title;
        this.startTime = props.startTime;
        this.duration = props.duration;
        this.details = props.details || {};
        this.tags = props.tags || [];
        this.notes = props.notes || [];
    }

    renderCompact() {
        return `${this.type}: ${this.title ?? this.details.text ?? ""}`;
    }

    renderFull() {
        return JSON.stringify(this, null, 2);
    }
}

// Subclasses
export class ActItem extends ScriptItem { }

export class SceneItem extends ScriptItem { }

export class DialogueItem extends ScriptItem {
    speaker?: string;
    text?: string;

    renderFull() {
        // Expand speaker name if it's an ID
        let speakerName = this.speaker;
        if (speakerName && speakerName in characters) {
            speakerName = characters[speakerName].name;
        }

        // Expand any location references in text/details
        let expandedText = this.text ?? this.details?.text ?? "";
        const locId = this.details?.locationId;
        if (locId && locId in locations) {
            expandedText += ` (Location: ${locations[locId].title})`;
        }

        return `${speakerName ?? "Unknown"}: ${expandedText}`;
    }

    renderCompact() {
        return `${this.speaker ?? "Unknown"}: ${this.text ?? ""}`;
    }
}

export class TransitionItem extends ScriptItem {
    transitionType?: "fade" | "cut" | "dissolve";
    renderCompact() { return `⏭ ${this.transitionType?.toUpperCase()} →`; }
}

export class LocationItem extends ScriptItem {
    mapData?: any;
    contacts?: string[];

    renderFull() {
        return `Location: ${this.title ?? "Unnamed"} (Lat: ${this.details.lat ?? "?"}, Lng: ${this.details.lng ?? "?"})`;
    }

    renderCompact() {
        return this.title ?? "Unnamed Location";
    }
}

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


export class Note {
    id!: string;
    parentId!: string;
    parentType!: string; // 'scriptItem' | 'character' | 'location' | 'tag'
    text!: string;
    media?: string[];

    constructor(data: Partial<Note>) {
        Object.assign(this, data);
    }

    renderCompact() { return this.text; }
}



export function reviveItem(obj: any): ScriptItem {
    switch (obj.type) {
        case "act": return new ActItem(obj);
        case "scene": return new SceneItem(obj);
        case "dialogue": return new DialogueItem(obj);
        case "transition": return new TransitionItem(obj);
        case "location": return new LocationItem(obj);
        default: return new ScriptItem(obj);
    }
}

export function reviveCharacter(obj: any) { return new Character(obj); }
export function reviveTag(obj: any) { return new Tag(obj); }
export function reviveNote(obj: any) { return new Note(obj); }
