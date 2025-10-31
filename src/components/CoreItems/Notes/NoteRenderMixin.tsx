import { JSX, createSignal } from "solid-js";
import TimelineItemEditor from "../../TimelineItemEditor";
import { notes, updateNote } from "../../../stores";

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
            const canonicalDetails = canonical.details ?? {};
            const urls: string[] = Array.isArray((canonicalDetails as any).urls) ? (canonicalDetails as any).urls : [];
            const [newUrl, setNewUrl] = createSignal("");

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

                    <section class="top-padding">
                        <h6>Links</h6>
                        <div class="field border label max">
                            <input
                                type="url"
                                value={newUrl()}
                                onInput={(e) => setNewUrl(e.currentTarget.value)}
                                onKeyDown={async (e) => {
                                    if (e.key === "Enter" && canonicalId) {
                                        const v = newUrl().trim();
                                        if (!v) return;
                                        const next = Array.from(new Set([...(urls ?? []), v]));
                                        await updateNote(canonicalId, { details: { urls: next } } as any);
                                        setNewUrl("");
                                    }
                                }}
                                onBlur={async (e) => {
                                    if (!canonicalId) return;
                                    const v = newUrl().trim();
                                    if (!v) return;
                                    const next = Array.from(new Set([...(urls ?? []), v]));
                                    await updateNote(canonicalId, { details: { urls: next } } as any);
                                    setNewUrl("");
                                }}
                            />
                            <label>Add URL</label>
                        </div>

                        {urls?.length ? (
                            <ul class="responsive">
                                {urls.map((u) => (
                                    <li class="row max middle-align">
                                        <a href={u} target="_blank" rel="noopener noreferrer">{u}</a>
                                        <span class="max"></span>
                                        <button class="chip small transparent right" title="Remove" onClick={async () => {
                                            if (!canonicalId) return;
                                            const next = urls.filter(x => x !== u);
                                            await updateNote(canonicalId, { details: { urls: next } } as any);
                                        }}><i>delete</i></button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p class="secondary-text">No links yet</p>
                        )}
                    </section>
                </article>
            );
        }
    };
}
