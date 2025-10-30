import { JSX } from "solid-js";
import TimelineItemEditor from "../../TimelineItemEditor";
import { notes } from "../../../stores";

type Constructor<T = {}> = new (...args: any[]) => T;

export function NoteRenderMixin<TBase extends Constructor>(Base: TBase) {
    return class extends Base {

        private resolveCanonical() {
            const obj: any = this;
            const details = obj.details ?? {};

            const isTimelineItem = details && typeof details.ref === "string";

            const canonical = isTimelineItem
                ? notes[details.ref] || { id: details.ref, title: obj.title, details: {} }
                : obj;

            return { isTimelineItem, canonical };
        }

        renderCompact(): JSX.Element {
            const title = (this as any).title ?? "Unknown note";
            return <h4 class="timeline-item note">{title}</h4>;
        }

        renderFull(): JSX.Element {
            const { canonical, isTimelineItem } = this.resolveCanonical();
            const canonicalId = canonical.id;
            const canonicalTitle = canonical.title ?? "Untitled note";
            const canonicalDetails = canonical.details ?? {};

            return (
                <article class="border padding">

                    <h3 class="field">
                        {isTimelineItem && canonicalId ? (
                            <TimelineItemEditor
                                store="notes"
                                id={canonicalId}
                                path="title"
                            />
                        ) : (
                            <TimelineItemEditor
                                item={canonical}
                                path="title"
                            />
                        )}
                    </h3>

                    <div class="field bottom-padding">
                        {isTimelineItem && canonicalId ? (
                            <TimelineItemEditor
                                store="notes"
                                id={canonicalId}
                                path="details"
                                key="text"
                                multiline
                                label="Text"
                            />
                        ) : (
                            <TimelineItemEditor
                                item={canonical}
                                path="details"
                                key="text"
                                multiline
                                label="Text"
                            />
                        )}
                    </div>
                </article>
            );
        }
    };
}
