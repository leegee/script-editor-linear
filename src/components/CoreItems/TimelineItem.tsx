import "./CoreItems.scss";
import TimelineItemEditor from "../TimelineItemEditor";
import { JSX } from "solid-js/jsx-runtime";
import { A } from "@solidjs/router";
import { notes, tags, updateTimelineItem } from "../../stores";
import PanelSectionHeader from "../PanelSectionHeader";
import { For, Show } from "solid-js";
import { useChildRoute } from "../ChildRoute";

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
    title?: string;
    details: Record<string, any>;
    duration?: number;
    tags: string[];
    notes: string[];
    protected _icon: string | undefined = undefined;
    get icon(): string | undefined { return this._icon; }

    // static ListTheseNotes(noteIds: string[], parentId: string) {
    //     const { childRoute } = useChildRoute();

    //     return (
    //         <ul class="list no-space border scroll">
    //             <li class="row middle-align">
    //                 <A href={childRoute('/attach-new/note/' + parentId)} class="chip small transparent">
    //                     <i>add</i><span>Add note</span>
    //                 </A>
    //             </li>

    //             <For each={noteIds}>
    //                 {(noteId) => (
    //                     <li>
    //                         <A href={childRoute("/notes/" + noteId)}>
    //                             {notes[noteId]?.title}
    //                         </A>
    //                     </li>
    //                 )}
    //             </For>
    //         </ul>
    //     );
    // }

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

    // Used by TypingInput
    renderAsText(): string {
        return this.type.toUpperCase() + ' ' + (this.title ?? '')
            + (this.tags.length ? `\n${this.tags.map((id: string) => `#${id}`).join("\n")}` : '')
            + (this.notes.length ? `\n${this.notes.map((id: string) => `@${id}`).join("\n")}` : '')
            + (this.duration ? `\n%${this.duration}` : '')
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
                    {this.compactTagList()}
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
                {this.compactTagList()}
            </div>
        );
    }

    renderFull(): JSX.Element {
        console.trace('render full');
        return <article>
            <PanelSectionHeader title={this.type} icon={this.icon} />
            <div class="field border label max">
                <TimelineItemEditor
                    id={this.id}
                    path="title"
                    label="Title"
                />
            </div>

            <Show when={this.details.hasOwnProperty('text')}>
                <div class="field border label max textarea">
                    <TimelineItemEditor
                        id={this.id}
                        path="details"
                        key="text"
                        label="Text"
                        multiline
                    />
                </div>
            </Show>

            <Show when={this.hasOwnProperty('duration')}>
                <div class="field border label max">
                    <TimelineItemEditor
                        id={this.id}
                        path="duration"
                        label="Duration"
                    />
                </div>
            </Show>

            {this.panelTagsSection()}

            {this.panelNotesSection()}

            <fieldset>
                <pre>{JSON.stringify(this, null, 2)}</pre>
            </fieldset>
        </article>;
    }

    renderCreateNew(props: {
        duration?: number;
        onChange: (field: string, value: any) => void;
    }): JSX.Element {
        console.trace('render create new');
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
        const { childRoute } = useChildRoute();

        return (
            <article class="no-margin">
                <details>
                    <summary>
                        <PanelSectionHeader title="Notes" icon="note_stack" badge={this.notes.length} />
                    </summary>

                    <nav class="list no-space border scroll ">
                        <For each={this.notes}>
                            {(noteId) => {
                                const n = notes[noteId];
                                return (
                                    <button class="chip small">
                                        <A href={childRoute(`/notes/${n.id}`)}>{n.title}</A>
                                    </button>
                                );
                            }}
                        </For>

                        <button class="chip small">
                            <A href={childRoute(`/attach-new/note/${this.id}`)}>
                                <i>add</i>
                                <span>Add Note</span>
                            </A>
                        </button>

                    </nav>
                </details>
            </article>
        );
    }

    panelTagsSection() {
        const { childRoute } = useChildRoute();

        return (
            <article class="no-margin">
                <details>
                    <summary>
                        <PanelSectionHeader title="Tags" icon="tag" badge={this.tags.length} />
                    </summary>

                    <nav>
                        <For each={this.tags}>
                            {(tagId) => (
                                <button class="tag chip small" style={`--this-clr:${tags[tagId].details.clr}`}>
                                    <span># {tags[tagId].title}</span>
                                </button>
                            )}
                        </For>
                        <button class="chip small">
                            <A href={childRoute(`attach-new/tag/${this.id}`)}>
                                <i>add</i>
                                Add Tag
                            </A>
                        </button>
                    </nav>
                </details>
            </article>
        );
    }

    compactTagList() {
        return (
            <div class="row right">
                <For each={this.tags}>
                    {(tag) => (
                        <span class={"circle tag"} style={{
                            "color": tags[tag].details.clr,
                            "background-color": tags[tag].details.clr,
                        }}>
                            <i>tag</i>
                            <div class="tooltip left">{tags[tag].title}</div>
                        </span>
                    )}
                </For>
            </div>
        );
    }

}
