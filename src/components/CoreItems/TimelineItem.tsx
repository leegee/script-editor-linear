import "./CoreItems.scss";
import { ActItem } from "./Act";
import { JSX } from "solid-js/jsx-runtime";
import { DialogueItem } from "./DialogueItem";
import { LocationItem } from "./LocationItem";
import { SceneItem } from "./SceneItem";
import { TransitionItem } from "./TransitionItem";

export interface TimelineItemProps {
    id: string;
    type: string; // "dialogue" | "location" | "transition" | "beat-marker" | "scene" | "act"
    title?: string;
    duration?: number;     // in seconds
    details?: Record<string, any>; // e.g., characterId, lat/lng, cues
    tags?: string[];
    notes?: string[];
}

export class TimelineItem {
    id: string;
    type: string;
    title?: string;
    duration?: number;
    details: Record<string, any>;
    tags: string[];
    notes: string[];

    constructor(props: TimelineItemProps) {
        this.id = props.id;
        this.type = props.type;
        this.title = props.title;
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
            </>
        );
    }
}

