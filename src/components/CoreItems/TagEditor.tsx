import styles from "./TagEditor.module.scss";
import { createSignal, createEffect, Show, For, Match, Switch } from "solid-js";
import AutoResizingTextarea from "../AutoResizingTextarea";
import { createTag, getTag, TagType, patchTag, removeTag, timelineItems, updateTimelineItem } from "../../stores";
import { showAlert } from "../../stores/modals";

interface TagEditorProps {
    tagId?: string;
    parentId?: string;
    onSave?: (tag: TagType | undefined) => void;
    onDelete?: (tagId: string) => void;
}

export default function TagEditor(props: TagEditorProps) {
    const existingTag = props.tagId ? getTag(props.tagId) : undefined;
    const [tag, setTag] = createSignal<TagType | undefined>(existingTag);

    // Local signals for editing
    const [title, setTitle] = createSignal(existingTag?.title ?? "");
    const [text, setText] = createSignal(existingTag?.details?.text ?? "");
    const [clrs, setClrs] = createSignal<string[]>(existingTag?.details?.clrs ?? []);
    const [editingClr, setEditingClr] = createSignal(-1);

    // Sync signals when tag changes
    createEffect(() => {
        const n = tag();
        if (!n) return;
        setTitle(n.title);
        setText(n.details?.text ?? "");
        setClrs(n.details?.clrs ?? []);
    });

    const handleSave = () => {
        if (!title()) {
            showAlert('Tags must have at least a title.')
            return;
        }

        let savedTag: TagType;
        if (!tag()) {
            savedTag = createTag({
                title: title(),
                details: { text: text(), clrs: clrs() },
            });
            setTag(savedTag);

            // Attach to parent if given
            if (props.parentId) {
                const parent = timelineItems[props.parentId];
                if (parent) {
                    parent.tags.push(savedTag.id);
                    updateTimelineItem(parent.id, "tags", "", parent.tags);
                }
            }
        } else {
            // Patch existing
            savedTag = tag()!;
            patchTag(savedTag.id, {
                title: title(),
                details: { text: text(), clrs: clrs() },
            });
        }

        if (props.onSave) props.onSave(savedTag);
    };

    const handleDelete = () => {
        const id = tag()?.id;
        if (!id) return;

        // Remove from every TimelineItem containing this tag
        Object.values(timelineItems).forEach(item => {
            if (item.tags.includes(id)) {
                item.tags = item.tags.filter(nid => nid !== id);
                updateTimelineItem(item.id, "tags", "", item.tags);
            }
        });

        removeTag(id);
        setTag(undefined);

        if (props.onDelete) props.onDelete(id);
        if (props.onSave) props.onSave(undefined);
    };

    const addClr = () => {
        setClrs([...clrs(), "blue"]);
        setEditingClr(clrs().length - 1);
    }

    const updateUrl = (idx: number, value: string) => {
        const copy = [...clrs()];
        copy[idx] = value;
        setClrs(copy);
    };

    const removeUrl = (idx: number) => {
        const copy = [...clrs()];
        copy.splice(idx, 1);
        setClrs(copy);
        setEditingClr(-1);
    };

    return (
        <article class={styles.tagEditor}>
            <div class="field label max border">
                <input
                    type="text"
                    value={title()}
                    onInput={(e) => setTitle(e.currentTarget.value)}
                />
                <label>Title</label>
            </div>

            <div class="field label textarea">
                <AutoResizingTextarea
                    value={text()}
                    onInput={(v) => setText(v)}
                    minHeight={50}
                    maxHeight={300}
                />
            </div>

            <fieldset>
                <legend>Colours</legend>
                <For each={clrs()}>
                    {(clr, i) => {
                        const idx = i();

                        return (
                            <>
                                <Show when={editingClr() === idx}>
                                    <nav class="no-space">
                                        <div class="max field border" style={{ background: clr }}>
                                            <input
                                                type="color"
                                                value={clr}
                                                onBlur={(e) => updateUrl(idx, e.currentTarget.value)}
                                            />
                                        </div>
                                        <div class="right-align">
                                            <button
                                                class="chip transparent tiny no-padding"
                                                onClick={() => setEditingClr(-1)}
                                            >
                                                <i class="tiny">check_small</i>
                                            </button>
                                        </div>
                                    </nav>
                                </Show>

                                <Show when={editingClr() !== idx}>
                                    <div class={"row " + styles.linkEditorRoot}>
                                        <div class={"fill small-opacity " + styles.linkEditor}>
                                            <button class="chip transparent small" onClick={() => setEditingClr(idx)} >
                                                <i>edit</i>
                                            </button>
                                            <button class="chip transparent small" onClick={() => removeUrl(idx)} >
                                                <i>delete</i>
                                            </button>
                                        </div>
                                    </div>
                                </Show>
                            </>
                        );
                    }}
                </For>

                <div class="space"></div>

                <div class="right-align">
                    <button class="chip small" onClick={addClr} disabled={editingClr() > -1}>
                        <i>add</i>Add Colour
                    </button>
                </div>
            </fieldset>

            <div class="space"></div>

            <footer class="top-padding extra-padding">
                <button class="button" onClick={handleSave}>
                    <i>save</i>
                    <span>Save</span>
                </button>
                <Show when={tag()?.id}>
                    <button class="transparent" onClick={handleDelete}>
                        <i>delete</i>
                        <span>Delete</span>
                    </button>
                </Show>
            </footer>
        </article >
    );
}
