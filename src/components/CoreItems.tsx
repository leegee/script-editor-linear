import { JSX } from "solid-js/jsx-runtime";
import InlineEditable from "../components/InlineEditable";
import { characters, locations, setTimelineItems } from "../stores";
import "./CoreItems.scss";
import { Accessor, For } from "solid-js";

export interface TimelineItemProps {
    id: string;
    type: string; // "dialogue" | "location" | "transition" | "beat-marker" | "scene" | "act"
    title?: string;
    startTime: number;    // in seconds
    duration?: number;     // in seconds
    details?: Record<string, any>; // e.g., characterId, lat/lng, cues
    tags?: string[];
    notes?: string[];
}

export class TimelineItem {
    id: string;
    type: string;
    title?: string;
    startTime: number;
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
        return <div>{JSON.stringify(this, null, 2)}</div>;
    }

    renderCreateNew(props: {
        startTime: number;
        duration?: number;
        onChange: (field: string, value: any) => void;
    }): JSX.Element {
        return (
            <>
                <div class="field border label max">
                    <input
                        type="text"
                        value={this.title ?? ""}
                        onInput={(e) => props.onChange("title", e.currentTarget.value)}
                    />
                    <label> Title</label>
                </div>

                <div class="field border label max">
                    <input
                        type="number"
                        min={0}
                        value={props.startTime ?? ""}
                        onInput={(e) => props.onChange("startTime", Number(e.currentTarget.value))}
                    />
                    <label> Start Time (seconds)</label>
                </div>

                {/* <div class="field border label max">
                    <input
                        type="number"
                        min={0}
                        value={props.duration ?? ""}
                        onInput={(e) => props.onChange("duration", Number(e.currentTarget.value))}
                    />
                    <label> Duration (seconds)</label>
                </div> */}
            </>
        );
    }
}

// Subclasses
export class ActItem extends TimelineItem {
    renderCompact() {
        return (
            <h2 class="timeline-item act">
                <InlineEditable value={this.title ?? "Untitled Act"} onUpdate={(v) => setTimelineItems(this.id, "title", v)} />
            </h2>
        );
    }
}

export class SceneItem extends TimelineItem {
    renderCompact() {
        return (
            <h3 class="timeline-item scene">
                <InlineEditable value={this.title ?? "Untitled Scene"} onUpdate={(v) => setTimelineItems(this.id, "title", v)} />
            </h3>
        );
    }
}

export class DialogueItem extends TimelineItem {
    renderCompact() {
        const char = characters[this.details.characterId];
        const speakerName = char?.name ?? "Unknown Speaker";

        return (
            <div class="timeline-item">
                {speakerName}
                <InlineEditable
                    class="dialogueText"
                    value={this.details.text}
                    onUpdate={(v) => setTimelineItems(this.id, "details", "text", v)}
                />
            </div>
        );
    }

    renderCreateNew(props: { startTime: number; duration?: number; onChange: (field: string, value: any) => void }) {
        return (
            <>
                <div class="field border label max">
                    <input
                        type="text"
                        value={this.details.text ?? ""}
                        onInput={(e) => props.onChange("text", e.currentTarget.value)}
                    />
                    <label> Dialogue Text</label>
                </div>

                <div class="field border label max">
                    <select
                        value={this.details.characterId ?? ""}
                        onChange={(e) => props.onChange("characterId", e.currentTarget.value)}
                    >
                        <option value="" disabled>Select a character</option>
                        {Object.values(characters).map((char) => (
                            <option value={char.id}>{char.name}</option>
                        ))}
                    </select>
                    <label> Character</label>
                </div>

                <div class="field border label max">
                    <input
                        type="number"
                        min={0}
                        value={props.startTime ?? ""}
                        onInput={(e) => props.onChange("startTime", Number(e.currentTarget.value))}
                    />
                    <label> Start Time (seconds)</label>
                </div>

                <div class="field border label max">
                    <input
                        type="number"
                        min={0}
                        value={props.duration ?? ""}
                        onInput={(e) => props.onChange("duration", Number(e.currentTarget.value))}
                    />
                    <label> Duration (seconds)</label>
                </div>
            </>
        );
    }
}

export class TransitionItem extends TimelineItem {
    transitionType?: "fade" | "cut" | "dissolve";
    renderCompact() {
        return <div class="timeline-item">{this.transitionType?.toUpperCase()} →</div>;
    }
    renderFull() {
        return <div class="timeline-item">{this.transitionType?.toUpperCase()} →</div>;
    }
    renderCreateNew(props: { startTime: number; duration?: number; onChange: (field: string, value: any) => void }) {
        const transitionTypes = ['chop', 'dissolve', 'fade', 'push', 'slide',];
        return (
            <>
                <div class="field border label max">
                    <select
                        value={this.transitionType ?? ""}
                        onChange={(e) => props.onChange("transitionType", e.currentTarget.value)}
                    >
                        <option value="" disabled>Select transition type</option>
                        <For each={transitionTypes}>
                            {(item) => (
                                <option value={item}>{item}</option>
                            )}
                        </For>
                    </select>
                    <label> Transition Type</label>
                </div>

                <div class="field border label max">
                    <input
                        type="number"
                        min={0}
                        value={props.startTime ?? ""}
                        onInput={(e) => props.onChange("startTime", Number(e.currentTarget.value))}
                    />
                    <label> Start Time (seconds)</label>
                </div>

                <div class="field border label max">
                    <input
                        type="number"
                        min={0}
                        value={props.duration ?? ""}
                        onInput={(e) => props.onChange("duration", Number(e.currentTarget.value))}
                    />
                    <label> Duration (seconds)</label>
                </div>
            </>
        );
    }
}

export class LocationItem extends TimelineItem {
    renderCompact() {
        const loc = locations[this.details.locationId];
        return <h5 class="timeline-item location">{loc?.title ?? "Unknown Location"}</h5>;
    }

    renderFull() {
        const loc = locations[this.details.locationId];
        if (!loc) return "Unknown Location";
        return (
            <div class="timeline-item location">
                <strong>{loc.title}</strong>
                <div>Lat: {loc.details.lat ?? "?"}, Lng: {loc.details.lng ?? "?"}</div>
            </div>
        );
    }

    renderCreateNew(props: { startTime: number; duration?: number; onChange: (field: string, value: any) => void }) {
        return (
            <>
                <div class="field border label max">
                    <select
                        value={this.details.locationId ?? ""}
                        onChange={(e) => props.onChange("locationId", e.currentTarget.value)}
                    >
                        <option value="" disabled>Select a location</option>
                        {Object.values(locations).map((loc) => (
                            <option value={loc.id}>{loc.title}</option>
                        ))}
                    </select>
                    <label> Select Location</label>
                </div>

                <div class="field border label max">
                    <input
                        type="number"
                        min={0}
                        value={props.startTime ?? ""}
                        onInput={(e) => props.onChange("startTime", Number(e.currentTarget.value))}
                    />
                    <label> Start Time (seconds)</label>
                </div>

                <div class="field border label max">
                    <input
                        type="number"
                        min={0}
                        value={props.duration ?? ""}
                        onInput={(e) => props.onChange("duration", Number(e.currentTarget.value))}
                    />
                    <label> Duration (seconds)</label>
                </div>
            </>
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

export class Location {
    id!: string;
    title!: string;
    details?: {
        lat?: number;
        lng?: number;
        address?: string;
        description?: string;
    };
    notes?: string[];

    constructor(data: Partial<Location>) {
        Object.assign(this, data);
    }

    renderCompact() {
        return this.title;
    }

    renderFull() {
        const { lat, lng, address, description } = this.details ?? {};
        return (
            <div class="location-detail">
                <strong>{this.title}</strong>
                {address && <div>{address}</div>}
                {(lat !== undefined && lng !== undefined) && (
                    <div>Lat: {lat}, Lng: {lng}</div>
                )}
                {description && <div>{description}</div>}
            </div>
        );
    }
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
    parentType!: string;
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
export function reviveLocation(obj: any) { return new Location(obj); }