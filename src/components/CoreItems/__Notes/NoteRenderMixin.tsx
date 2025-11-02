import { JSX } from "solid-js";
import TimelineItemEditor from "../../TimelineItemEditor";
import { getNote } from "../../../stores";

type Constructor<T = {}> = new (...args: any[]) => T;

export function NoteRenderMixin<TBase extends Constructor>(Base: TBase) {
    return class extends Base {
        renderCompact(): JSX.Element {
            const title = (this as any).title ?? "Unknown note";
            return <h4 class="timeline-item note">{title}</h4>;
        }

        renderFull(): JSX.Element {
            const obj: any = this;
            const canonical = obj.details?.ref ? getNote(obj.details.ref) : obj;

            return (
                <article class="border padding">
                    <header class="no-padding">
                        <nav>
                            <h3>{canonical?.title ?? "Untitled Note"}</h3>
                        </nav>
                    </header>

                    <div class="field bottom-padding">
                        <TimelineItemEditor
                            item={canonical}
                            path="title"
                            label="Title"
                        />
                        <TimelineItemEditor
                            item={canonical}
                            path="details"
                            key="text"
                            multiline
                            label="Text"
                        />
                    </div>
                </article>
            );
        }
    };
}
