import "./CoreItems.scss";
import TimelineItemEditor from "../ItemEditor";
import { JSX } from "solid-js/jsx-runtime";

export interface TimelineItemProps {
    id: string;
    type: string; // "dialogue" | "location" | "transition" | "beat-marker" | "scene" | "act"
    title?: string;
    duration?: number;                 // in seconds
    details?: Record<string, any>;     // e.g., characterId, lat/lng, cues
    tags?: string[];
    notes?: string[];
}

/**
 * Base model for any timeline item.
 */
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

    /**
     * Create a new instance with shallow-merged updates.
     * Used for immutable store updates.
     */
    cloneWith(updates: Partial<TimelineItemProps>): this {
        const props: TimelineItemProps = {
            ...this,
            ...updates,
            details: { ...this.details, ...updates.details },
            tags: updates.tags ?? [...this.tags],
            notes: updates.notes ?? [...this.notes],
        };

        // @ts-ignore
        return new (this.constructor as any)(props);
    }


    /**
     * Compact display (e.g., in list views)
     */
    renderCompact(): JSX.Element {
        return (
            <div>
                Base.renderCompact:
                {this.type}: {this.title ?? this.details.text ?? ""}
            </div>
        );
    }

    /**
     * Full debug display
     */
    renderFull(): JSX.Element {
        return <div>Base.renderFull: {JSON.stringify(this, null, 2)}</div>;
    }

    /**
     * Form for creating / editing timeline items.
     */
    renderCreateNew(props: {
        duration?: number;
        onChange: (field: string, value: any) => void;
    }): JSX.Element {
        return (
            <>
                <div class="field border label max">
                    <TimelineItemEditor
                        id={this.id}
                        path="title"
                        defaultValue={this.title ?? "Title"}
                    />

                    <label>Title</label>
                </div>
            </>
        );
    }

    /**
     * Prepare a merged data object from user-editable fields.
     * Fields matching instance keys become top-level; others go into `details`.
     */
    prepareFromFields(fields: Record<string, any>) {
        const instanceKeys = Object.keys(this);
        const topLevel: Record<string, any> = {};
        const details: Record<string, any> = {};

        for (const key in fields) {
            if (instanceKeys.includes(key)) {
                topLevel[key] = fields[key];
            } else {
                details[key] = fields[key];
            }
        }

        return {
            ...topLevel,
            details: { ...this.details, ...details },
        };
    }

    openEditor() { }
}
