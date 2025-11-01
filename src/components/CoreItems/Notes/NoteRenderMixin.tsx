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
            const [showAdd, setShowAdd] = createSignal(false);

            return (
                <article class="border padding">
                    <header class="no-padding">
                        <nav>
                            <h3 class="max">
                                {isTimelineItem && canonicalId ? (
                                    <TimelineItemEditor
                                        store="notes"
                                        id={canonicalId}
                                        path="title"
                                        label="title"
                                    />
                                ) : (
                                    <TimelineItemEditor
                                        item={canonical}
                                        path="title"
                                        label="title"
                                    />
                                )}
                            </h3>
                            <i>note_alt</i>
                        </nav>
                    </header>

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
                        <header class="no-padding">
                            <nav>
                                <h6 class="max">Links</h6>
                                <button
                                    class="chip small transparent no-border"
                                    title={showAdd() ? "Close" : "Add link"}
                                    onClick={() => setShowAdd(v => !v)}
                                >
                                    <i>{showAdd() ? "close" : "add"}</i>
                                </button>
                            </nav>
                        </header>

                        {showAdd() && (
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
                                            setShowAdd(false);
                                        }
                                    }}
                                    onBlur={async (e) => {
                                        if (!canonicalId) return;
                                        const v = newUrl().trim();
                                        if (!v) return;
                                        const next = Array.from(new Set([...(urls ?? []), v]));
                                        await updateNote(canonicalId, { details: { urls: next } } as any);
                                        setNewUrl("");
                                        setShowAdd(false);
                                    }}
                                />
                                <label>Add URL</label>
                            </div>
                        )}

                        {urls?.length ? (
                            <ul class="responsive list border no-space scroll surface">
                                {urls.map((u) => {
                                    // Simple check for file type
                                    const isImage = /\.(jpe?g|png|gif|webp|avif|bmp|svg)$/i.test(u);
                                    const isVideo = /\.(mp4|webm|ogg)$/i.test(u);

                                    return (
                                        <li class="row max middle-align">
                                            {isImage || isVideo ? (
                                                <a href={u} target="_blank" rel="noopener noreferrer" class="row middle-align right-margin">
                                                    {isImage && <img src={u} alt="preview" style={{ width: "1em", height: "1em", "object-fit": "cover" }} />}
                                                    {isVideo && <video src={u} style={{ width: "1em", height: "1em", "object-fit": "cover" }} muted />}
                                                    {u}
                                                </a>
                                            ) : (
                                                <a href={u} target="_blank" rel="noopener noreferrer">{u}</a>
                                            )}

                                            <span class="max"></span>

                                            <button
                                                class="chip small no-border transparent right"
                                                title="Remove"
                                                onClick={async () => {
                                                    if (!canonicalId) return;
                                                    const next = urls.filter(x => x !== u);
                                                    await updateNote(canonicalId, { details: { urls: next } } as any);
                                                }}
                                            >
                                                <i>delete</i>
                                            </button>
                                        </li>
                                    );
                                })}
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
