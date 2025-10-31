import "ol/ol.css";
import { createSignal, For, type JSX } from "solid-js";
import { A } from "@solidjs/router";
import { notes, addNote } from "../../../stores";
import { TimelineItem, TimelineItemProps } from "../TimelineItem";
import { NoteRenderMixin } from "./NoteRenderMixin";
import { CanonicalNote } from "./CanonicalNote";
import PanelSectionHeader from "../../PanelSectionHeader";

export type TimelineNoteItemType = InstanceType<typeof TimelineNoteItem>;

export class BaseTimelineNoteItem extends TimelineItem {
    /**
     * Safely reconstructs a TimelineNoteItem from serialized data.
     * Preserves coordinate details if they exist.
     */
    static revive(obj: any): TimelineNoteItemType {
        const details =
            obj.details && typeof obj.details === "object"
                ? obj.details
                : { ref: obj.id };

        return new TimelineNoteItem({
            ...obj,
            details,
        });
    }

    static ListNotesHeader() {
        return <PanelSectionHeader title='Notes' icon='note_stack' />
    }

    static ListNotes() {
        return (
            <ul class="responsive scroll surface">
                <For each={Object.values(notes)}>
                    {(n) => (
                        <li>
                            <A href={`notes/${n.id}`}>{n.title}</A>
                        </li>
                    )}
                </For>
            </ul>
        );
    }

    constructor(props: Omit<TimelineItemProps, "type">) {
        const ref = props.details?.ref ?? props.id;
        const canonical = notes[ref];

        super({
            ...props,
            id: props.id || crypto.randomUUID(),
            type: "note",
            title: props.title ?? canonical?.title ?? "Untitled Note",
            details: { ref, ...props.details },
        });
    }

    renderCreateNew(props: { duration?: number; onChange: (field: string, value: any) => void }) {
        const [mode, setMode] = createSignal<"select" | "new">("select");

        return (
            <>
                <div class="field border middle-align max">
                    <label class="switch icon">
                        <input
                            type="checkbox"
                            checked={mode() === "new"}
                            onChange={(e) =>
                                setMode(e.currentTarget.checked ? "new" : "select")
                            }
                        />
                        <span>
                            <i>add_note</i>
                        </span>
                    </label>
                    <span class="left-padding">
                        {mode() === "new"
                            ? "Create a new note"
                            : "Select a note"}
                    </span>
                </div>

                {mode() === "new" && (
                    <>
                        <div class="field border label max">
                            <input
                                type="text"
                                placeholder="Title"
                                onInput={(e) =>
                                    props.onChange("title", e.currentTarget.value)
                                }
                            />
                            <label>Title</label>
                        </div>
                    </>
                )}

                {mode() === "select" && (
                    <div class="field border label max">
                        <select
                            value={this.details.ref ?? ""}
                            onChange={(e) => props.onChange("ref", e.currentTarget.value)}
                        >
                            <option value="" disabled>
                                Select a note
                            </option>
                            {Object.values(notes).map((loc) => (
                                <option value={loc.id}>{loc.title}</option>
                            ))}
                        </select>
                        <label>Existing note</label>
                    </div>
                )}
            </>
        );
    }

    prepareFromFields(fields: Record<string, any>) {
        let ref = fields.ref;

        if (!ref) {
            const newCanonical = new CanonicalNote({
                title: fields.title ?? "Untitled note",
                details: {
                },
            });
            addNote(newCanonical);
            ref = newCanonical.id;
        }

        return {
            type: "note",
            title: fields.title,
            duration: fields.duration,
            details: { ref },
        };
    }

    timelineContent(zoom: number): JSX.Element | string | undefined {
        return this.title;
    }

}

export const TimelineNoteItem = NoteRenderMixin(BaseTimelineNoteItem);
