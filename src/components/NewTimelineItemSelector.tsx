import styles from './NewTimelineItemSelector.module.scss';
import { createSignal, createEffect, JSX, For } from "solid-js";
import { createTimelineItem } from "../lib/createTimelineItem";
import { timelineSequence, timelineItems } from "../stores";
import { ActItem, SceneItem, DialogueItem, LocationItem, TransitionItem } from "../components/CoreItems";

interface NewTimelineItemSelectorProps {
    insertAtIndex: number;
    onCreated?: (id: string) => void;
    onCancel: () => void;
}

export default function NewTimelineItemSelector(props: NewTimelineItemSelectorProps) {
    const [type, setType] = createSignal<"act" | "scene" | "dialogue" | "location">("dialogue");
    const [fields, setFields] = createSignal<Record<string, any>>({});
    const [startTime, setStartTime] = createSignal<number>(0);
    const [duration, setDuration] = createSignal<number | undefined>(undefined);

    const types: { value: "act" | "dialogue" | "location" | "scene" | "transition"; label: string }[] = [
        { value: "act", label: "Act" },
        { value: "dialogue", label: "Dialogue" },
        { value: "location", label: "Location" },
        { value: "scene", label: "Scene" },
        { value: "transition", label: "Transition" },
    ];

    // Compute default startTime based on previous item
    createEffect(() => {
        const seq = timelineSequence();
        if (props.insertAtIndex > 0 && seq[props.insertAtIndex - 1]) {
            const prevId = seq[props.insertAtIndex - 1];
            const prevItem = timelineItems[prevId];
            if (prevItem?.startTime != null && prevItem?.duration != null) {
                setStartTime(prevItem.startTime + prevItem.duration);
            }
        } else {
            setStartTime(0);
        }
    });

    const handleChange = (field: string, value: any) => {
        setFields((prev) => ({ ...prev, [field]: value }));
    };

    const handleCreate = async () => {
        try {
            const item = await createTimelineItem(
                {
                    type: type(),
                    title: fields().title,
                    startTime: startTime(),
                    duration: duration(),
                    details: { ...fields() }
                },
                { insertAtIndex: props.insertAtIndex }
            );

            // Reset form
            setFields({});
            setDuration(undefined);

            props.onCreated?.(item.id);
        } catch (err) {
            console.error("Failed to create timeline item:", err);
        }
    };

    // Map type string to class
    const typeMap = {
        act: ActItem,
        dialogue: DialogueItem,
        location: LocationItem,
        scene: SceneItem,
        transition: TransitionItem,
    };

    return (
        <fieldset class={styles.component + " padding fill  max surface-dim"} style={{ position: 'fixed', "max-width": "400px" }}>
            <legend class="surface-dim">
                <h3>Create a new item</h3>
            </legend>

            <div class="field border label">
                <select value={type()} onChange={(e) => setType(e.currentTarget.value as any)}>
                    <For each={types}>
                        {(t) => <option value={t.value}>{t.label}</option>}
                    </For>
                </select>
                <label>Type</label>
            </div>

            {/* Render type-specific form */}
            {(() => {
                const ItemClass = typeMap[type()];
                const itemInstance = new ItemClass({
                    id: "new",
                    type: type(),
                    startTime: startTime()
                });
                return itemInstance.renderCreateNew({
                    onChange: handleChange,
                    startTime: startTime(),
                    duration: duration()
                });
            })()}

            <div class="field border label top-margin" style={{ display: "flex", gap: "8px" }}>
                <button onClick={props.onCancel} class="transparent">Cancel</button>
                <button onClick={handleCreate} class="primary">Create Timeline Item</button>
            </div>
        </fieldset>
    );
}
