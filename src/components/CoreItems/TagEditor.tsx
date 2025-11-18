import styles from "./TagEditor.module.scss";
import { createSignal, createEffect, Show, For } from "solid-js";
import AutoResizingTextarea from "../AutoResizingTextarea";
import {
    addTag,
    getTag,
    TagType,
    patchTag,
    removeTag,
    timelineItems,
    updateTimelineItem,
    tags,
    removeTagInstances
} from "../../stores";
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

    const [title, setTitle] = createSignal(existingTag?.title ?? "");
    const [text, setText] = createSignal(existingTag?.details?.text ?? "");
    const [clr, setClr] = createSignal(existingTag?.details?.clr ?? "#0000");
    const [selectedId, setSelectedId] = createSignal<string>("");

    // Sync when tag changes
    createEffect(() => {
        const t = tag();
        if (!t) return;
        setTitle(t.title);
        setText(t.details?.text ?? "");
        setClr(t.details?.clr ?? "transparent");
        setSelectedId(t.id);
    });

    const handleSelectExisting = (id: string) => {
        if (!id) return;
        const existing = getTag(id);
        if (existing) setTag(existing);
    };

    const handleSave = () => {
        if (!title()) {
            showAlert("Tags must have at least a title.");
            return;
        }

        let savedTag: TagType;
        if (!tag()) {
            savedTag = addTag({
                title: title(),
                details: { text: text(), clr: clr() },
            });
            setTag(savedTag);
        } else {
            savedTag = tag()!;
            patchTag(savedTag.id, {
                title: title(),
                details: { text: text(), clr: clr() },
            });
        }

        if (props.parentId) {
            const parent = timelineItems[props.parentId];
            if (parent && !parent.tags.includes(savedTag.id)) {
                parent.tags.push(savedTag.id);
                updateTimelineItem(parent.id, "tags", "", parent.tags);
            }
        }

        props.onSave?.(savedTag);
    };

    const handleDelete = () => {
        const id = tag()?.id;
        if (!id) return;

        removeTagInstances(id);

        removeTag(id);
        setTag(undefined);
        props.onDelete?.(id);
        props.onSave?.(undefined);
    };

    return (
        <article class={styles.tagEditor}>
            <div class="field border label">
                <select
                    value={selectedId()}
                    onChange={(e) => handleSelectExisting(e.currentTarget.value)}
                >
                    <option value="">Choose existing tag</option>
                    <For each={Object.values(tags)}>
                        {(t) => <option value={t.id}>{t.title}</option>}
                    </For>
                </select>
                <label>Attach existing tag</label>
            </div>

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

            <fieldset class="border label no-margin tiny-padding">
                <legend>Colour</legend>
                <div class="field tiny-margin" style={{ background: clr(), 'border-radius': '4pt' }}>
                    <input
                        type="color"
                        value={clr()}
                        onInput={(e) => setClr(e.currentTarget.value)}
                    />
                </div>
            </fieldset>

            <footer class="top-padding extra-padding">
                <button class="button" onClick={handleSave} disabled={!title()}>
                    <i>save</i>
                    <span>Save</span>
                </button>
                <Show when={tag()?.id}>
                    <button class="transparent" onClick={handleDelete}>
                        <i>delete</i>
                        <span>Delete all occurrences</span>
                    </button>
                </Show>
            </footer>
        </article>
    );
}
