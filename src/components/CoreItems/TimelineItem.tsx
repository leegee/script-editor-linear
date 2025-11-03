import "./CoreItems.scss";
import TimelineItemEditor from "../TimelineItemEditor";
import { JSX } from "solid-js/jsx-runtime";
import { A } from "@solidjs/router";
import { childRoute } from "../../lib/routeResolver";
import { notes, NoteType, removeNote } from "../../stores";
import PanelSectionHeader from "../PanelSectionHeader";
import { For } from "solid-js";
import NoteEditor from "./NoteEditor";

export interface TimelineItemProps {
    id: string;
    type: string;                       // "dialogue" | "location" | "transition" | "beat-marker" | "scene" | "act"
    title?: string;
    duration?: number;                 // in seconds
    details?: Record<string, any>;     // e.g., ref, lat/lng, cues
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

    static ListTheseNotes(noteIds: string[], parentId: string) {
        return (
            <ul class="list no-space border scroll">
                <li class="row middle-align">
                    <A href={childRoute('/attach-new/note/' + parentId)} class="chip small transparent">
                        <i>add</i><span>Add note</span>
                    </A>
                </li>

                <For each={noteIds}>
                    {(noteId) => (
                        <li>
                            <A href={childRoute("/notes/" + noteId)}>
                                {notes[noteId]?.title}
                            </A>
                        </li>
                    )}
                </For>
            </ul>
        );
    }

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

        return new (this.constructor as any)(props);
    }

    renderCompact(): JSX.Element {
        return (
            <div style="opacity:80%">
                <code>{this.type.toLocaleUpperCase()}</code>
                {" "} &mdash; {" "}
                {this.title ?? this.details.text ?? ""}
            </div>
        );
    }

    renderFull(): JSX.Element {
        return <fieldset>
            <h3>{this.type}</h3>
            <pre>{JSON.stringify(this, null, 2)}</pre>
        </fieldset>;
    }

    // renderCompact() { return <span>{this.title}</span> }

    // renderFull() {
    //     return <article>
    //         <h2>
    //             <TimelineItemEditor id={this.id} path="title" store="characters" />
    //         </h2>
    //     </article>;
    // }

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

    timelineContent(zoom: number): JSX.Element | string | undefined {
        return undefined;
    }

    renderNotesList() {
        return (
            <ul class="notes-list">
                {this.notes.map((noteId) => (
                    <li>
                        <a href={`/notes/${noteId}`}>{notes[noteId]?.title || "(empty)"}</a>
                    </li>
                ))}
            </ul>
        );
    }

    panelNotesSection() {
        return (
            <article>
                <details>
                    <summary>
                        <PanelSectionHeader title="Notes" icon="note_stack" badge={this.notes.length} />
                    </summary>

                    <div class="top-padding center-align">
                        <button class="transparent small border">
                            <A href={childRoute(`/attach-new/note/${this.id}`)}>
                                <i>add</i>
                                <span>Add Note</span>
                            </A>
                        </button>
                    </div>

                    <ul class="list no-space border scroll ">
                        <For each={this.notes}>
                            {(noteId) => {
                                const n = notes[noteId];
                                return (
                                    <li>
                                        <A href={childRoute(`/notes/${n.id}`)}>{n.title}</A>
                                    </li>
                                );
                            }}
                        </For>
                    </ul>
                </details>
            </article>
        );
    }


}
