import "./CoreItems.scss";
import TimelineItemEditor from "../TimelineItemEditor";
import { JSX } from "solid-js/jsx-runtime";
import { notes, updateTimelineItem } from "../../stores";
import PanelSectionHeader from "../PanelSectionHeader";
import { For, Show } from "solid-js";
import { Tag } from "./Tag";
import { Note } from "./Note";

export interface TimelineItemProps {
    id: string;
    type: string;                       // "dialogue" | "location" | "transition" | "beat-marker" | "scene" | "act"
    title?: string;
    duration?: number;                 // in seconds
    details?: Record<string, any>;     // e.g., ref, lat/lng, cues, date
    tags?: string[];
    notes?: string[];
}

/**
 * Base model for any timeline item.
 */
export class TimelineItem {
    id: string;
    type: string;
    title: string;
    details: Record<string, any>;
    duration?: number;
    tags: string[];
    notes: string[];
    protected _icon: string | undefined = undefined;
    get icon(): string | undefined { return this._icon; }

    constructor(props: TimelineItemProps) {
        this.id = props.id;
        this.type = props.type;
        this.title = props.title || '';
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

        return new (this.constructor as any)(props);
    }

    metaAsText(): string {
        return [
            (this.tags.length ? `${this.tags.map(id => `#${id}`).join(", ")}` : ''),
            (this.notes.length ? `${this.notes.map(id => `&${id}`).join(", ")}` : ''),
            (this.duration ? `^${this.duration}` : '')
        ]
            .filter(Boolean)
            .join(", ");
    }

    // Used by TypingInput
    renderAsText(): string {
        const meta = this.metaAsText();
        return this.type.toUpperCase() + ' ' + (this.title ?? '')
            + (meta ? "\n" + meta : "")
            + (this.details.text ? `\n${this.details.text}` : '')
            ;
    }

    // Used by drag-and-drop list
    renderCompact(): JSX.Element {
        if (this.type === 'act' || this.type === 'scene' || this.type === "location") {
            return (
                <h2 class="with-tag">
                    <TimelineItemEditor
                        id={this.id}
                        path="title"
                    />
                    <div class="right row">
                        {this.compactNoteList()}
                        {this.compactTagList()}
                    </div>
                </h2>
            );
        }

        return (
            <div style="opacity:80%" class="with-tag">
                <div>
                    <code>{this.type.toLocaleUpperCase()}</code>
                    {" "}
                    <Show when={this.title || this.details.text}>
                        &mdash; {" "}
                    </Show>
                    {this.title || this.details.text || ""}
                </div>
                <div class="row right">
                    {this.compactNoteList()}
                    {this.compactTagList()}
                </div>
            </div>
        );
    }

    renderFull(): JSX.Element {
        return <>
            <PanelSectionHeader title={this.type} icon={this.icon} />

            <TimelineItemEditor
                id={this.id}
                path="title"
                label="Title"
            />

            <Show when={this.details.hasOwnProperty('text')}>
                <TimelineItemEditor
                    id={this.id}
                    path="details"
                    key="text"
                    label="Text"
                    multiline
                />
            </Show>

            <Show when={this.hasOwnProperty('duration')}>
                <TimelineItemEditor
                    id={this.id}
                    path="duration"
                    label="Duration"
                />
            </Show>

            {this.panelTagsSection()}

            {this.panelNotesSection()}

            <details>
                <summary class="top-margin">
                    <h5 class="small-opacity">Debug</h5>
                </summary>
                <pre><code class="small-text">{JSON.stringify(this, null, 2)}</code></pre>
            </details>
        </>;
    }

    renderCreateNew(props: {
        duration?: number;
        onChange: (field: string, value: any) => void;
    }): JSX.Element {
        return (
            <article>
                <div class="field border label max">
                    <TimelineItemEditor
                        id={this.id}
                        path="title"
                        label="title"
                    />
                </div>
            </article>
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

    timelineContent(zoom: number): JSX.Element | string | undefined {
        return <i>{this.icon}</i>;
    }

    detailsDate() {
        return (
            <div class="field prefix max small">
                <input type="date"
                    style="font-size: 100%"
                    class="small no-padding"
                    value={this.details.date}
                    onInput={(e) => {
                        updateTimelineItem(this.id, "details", "date", e.currentTarget.value);
                        this.details.date = e.currentTarget.value;
                    }}
                />
                <i style="inset:50% 0 auto auto">today</i>
            </div>
        );
    }

    renderNotesList() {
        return (
            <ul class="notes-list">
                {this.notes.map((noteId) => (
                    <li>
                        <a href={`/notes/${noteId}`}>{notes[noteId]?.title || "(empty note)"}</a>
                    </li>
                ))}
            </ul>
        );
    }

    panelNotesSection() {
        return (
            <aside class="no-margin">
                <details>
                    <summary>
                        <PanelSectionHeader title="Notes" icon="note_stack" badge={this.notes.length} />
                    </summary>

                    <nav class="scroll ">
                        <For each={this.notes}>
                            {(noteId) => <Note.Chip id={noteId} />}
                        </For>
                        <Note.Chip addToId={this.id} />
                    </nav>
                </details>
            </aside>
        );
    }

    panelTagsSection() {
        return (
            <aside class="no-margin">
                <details>
                    <summary>
                        <PanelSectionHeader title="Tags" icon="tag" badge={this.tags.length} />
                    </summary>

                    <nav>
                        <For each={this.tags}>
                            {(tagId) => <Tag.Chip id={tagId} />}
                        </For>
                        <Tag.Chip addToId={this.id} />
                    </nav>
                </details>
            </aside>
        );
    }

    compactTagList() {
        return (
            <For each={this.tags}>
                {(tagId) => <Tag.Compact id={tagId} />}
            </For>
        );
    }

    compactNoteList() {
        return (
            <>
                <For each={this.notes}>
                    {(noteId) => <Note.Compact id={noteId} />}
                </For>
            </>
        );
    }

}
