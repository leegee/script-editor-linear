import InlineEditable from "../components/InlineEditable";
import { characters, locations, setTimelineItems } from "../stores";

export interface TimelineItemProps {
    id: string;
    type: string; // "dialogue" | "location" | "transition" | "beat-marker" | "scene" | "act"
    title?: string;
    startTime?: number;    // in seconds
    duration?: number;     // in seconds
    details?: Record<string, any>; // e.g., characterId, lat/lng, cues
    tags?: string[];
    notes?: string[];
}

export class TimelineItem {
    id: string;
    type: string;
    title?: string;
    startTime?: number;
    duration?: number;
    details: Record<string, any>;
    tags: string[];
    notes: string[];

    constructor(props: TimelineItemProps) {
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
        return <div>{this.type}: {this.title ?? this.details.text ?? ""}</div>;
    }

    renderFull() {
        return <div>JSON.stringify(this, null, 2)</div>
    }
}

// Subclasses
export class ActItem extends TimelineItem {
    renderCompact() {
        return (
            <div class="act">
                <h2>{this.title ?? "Untitled Act"} </h2>
            </div>
        );
    }
}

export class SceneItem extends TimelineItem {
    renderCompact() {
        return (
            <div class="scene">
                <h3>{this.title ?? "Untitled Act"} </h3>
            </div>
        );
    }
}


export class DialogueItem extends TimelineItem {
    renderCompact() {
        const char = characters[this.details.characterId];
        const speakerName = char?.name ?? "Unknown Speaker";

        return <div class="dialog">
            {speakerName}
            <InlineEditable value={this.details.text} onUpdate={(v) => setTimelineItems(this.id, "details", "text", v)} />
        </div>;
    }
}


export class TransitionItem extends TimelineItem {
    transitionType?: "fade" | "cut" | "dissolve";
    renderCompact() { return `⏭ ${this.transitionType?.toUpperCase()} →`; }
}

export class LocationItem extends TimelineItem {
    renderCompact() {
        const loc = locations[this.details.locationId];
        return <h5>{loc?.title ?? "Unknown Location"}</h5>
    }

    renderFull() {
        const loc = locations[this.details.locationId];
        if (!loc) return "Unknown Location";
        return (
            <div class="location">
                <strong>{loc.title}</strong>
                <div>Lat: {loc.details.lat ?? "?"}, Lng: {loc.details.lng ?? "?"}</div>
            </div>
        );
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
    parentType!: string; // 'timelineItem' | 'character' | 'location' | 'tag'
    text!: string;
    media?: string[];

    constructor(data: Partial<Note>) {
        Object.assign(this, data);
    }

    renderCompact() { return this.text; }
}



export function reviveItem(obj: any): TimelineItem {
    switch (obj.type) {
        case "act": return new ActItem(obj);
        case "scene": return new SceneItem(obj);
        case "dialogue": return new DialogueItem(obj);
        case "transition": return new TransitionItem(obj);
        case "location": return new LocationItem(obj);
        default: return new TimelineItem(obj);
    }
}

export function reviveCharacter(obj: any) { return new Character(obj); }
export function reviveTag(obj: any) { return new Tag(obj); }
export function reviveNote(obj: any) { return new Note(obj); }
