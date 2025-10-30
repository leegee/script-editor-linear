import { JSX } from "solid-js";
import TimelineItemEditor from "../../TimelineItemEditor";
import { notes } from "../../../stores";
import { BaseTimelineNoteItem } from "./TimelineNoteItem";

type Constructor<T = {}> = new (...args: any[]) => T;

export function NoteRenderMixin<TBase extends Constructor>(Base: TBase) {
    return class extends Base {
        renderCompact(): JSX.Element {
            const title = (this as any).title ?? "Unknown note";
            return <h4 class="timeline-item note">{title}</h4>;
        }

        renderFull(): JSX.Element {
            const obj: any = this;
            const details = obj.details ?? {};
            const title = obj.title ?? "Unknown note";

            // Determine if this is a TimelineNoteItem by checking if it has a 'details.ref'
            const isTimelineItem = details && typeof details.ref === "string";

            // Either fetch canonical note or fall back to a safe stub
            const canonical = isTimelineItem
                ? notes[details.ref] || { id: details.ref, title: obj.title, details: {} }
                : { details };

            // Type guard: ensure canonical has id/title before accessing
            const hasCanonicalFields = (
                c: any
            ): c is { id: string; title: string; details: any } =>
                typeof c.id === "string" && typeof c.title === "string";

            const canonicalId = hasCanonicalFields(canonical) ? canonical.id : undefined;
            const canonicalTitle = hasCanonicalFields(canonical) ? canonical.title ?? title : title;
            const canonicalDetails = canonical.details ?? {};

            return (
                <article class="border padding">
                    <h3 class="field">
                        {isTimelineItem && canonicalId ? (
                            <TimelineItemEditor
                                store="notes"
                                id={canonicalId}
                                path="title"
                                defaultValue={canonicalTitle}
                            />
                        ) : (
                            <TimelineItemEditor
                                item={obj}
                                path="title"
                                defaultValue={canonicalTitle}
                            />
                        )}
                    </h3>

                    {/* <TimelineItemEditor
                        store="notes"
                        id={canonicalId}
                        path="title"
                        defaultValue={canonicalTitle}
                    /> */}

                </article>
            );
        }
    };
}
