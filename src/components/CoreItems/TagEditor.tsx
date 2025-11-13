import styles from "./TagEditor.module.scss";
import { createSignal, createEffect, Show, For, Match, Switch } from "solid-js";
import AutoResizingTextarea from "../AutoResizingTextarea";
import { addTag, getTag, TagType, patchTag, removeTag, timelineItems, updateTimelineItem } from "../../stores";
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
    const [clr, setClr] = createSignal(existingTag?.details?.clr ?? "transparent");

    // Sync signals when tag changes
    createEffect(() => {
        const n = tag();
        if (!n) return;
        setTitle(n.title);
        setText(n.details?.text ?? "");
    });

    const handleSave = () => {
        if (!title()) {
            showAlert('Tags must have at least a title.')
            return;
        }

        let savedTag: TagType;
        if (!tag()) {
            savedTag = addTag({
                title: title(),
                details: { text: text(), clr: clr() },
            });
            setTag(savedTag);
        }
        else {
            // Patch existing
            savedTag = tag()!;
            patchTag(savedTag.id, {
                title: title(),
                details: { text: text(), clr: clr() },
            });
        }

        // Attach to parent if given
        console.log('Tag Editor: parent Id', props.parentId);
        if (props.parentId) {
            const parent = timelineItems[props.parentId];
            console.log('Tag Editor: parent', parent);
            if (parent) {
                parent.tags.push(savedTag.id);
                updateTimelineItem(parent.id, "tags", "", parent.tags);
            }
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

    const removeUrl = (idx: number) => {
        const copy = [...clr()];
        copy.splice(idx, 1);
        setClr(copy);
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

            <fieldset class="border label no-margin tiny-padding">
                <legend>Colour</legend>
                <div class="field tiny-margin" style={{ background: clr(), 'border-radius': '4pt' }}>
                    <input
                        type="color"
                        value={clr()}
                        onBlur={(e) => setClr(e.currentTarget.value)}
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
                        <span>Delete all occurances</span>
                    </button>
                </Show>
            </footer>
        </article >
    );
}
