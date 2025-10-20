import styles from './NewTimelineItemSelector.module.scss';
import { createSignal, JSX, For } from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";
import { createTimelineItem } from "../lib/createTimelineItem";
import { ActItem, SceneItem, DialogueItem, LocationItem, TransitionItem, TimelineItem } from "../components/CoreItems";

export type TimelineItemType = "act" | "scene" | "dialogue" | "location" | "transition";

function newTimelineItem(
    type: TimelineItemType,
    id = crypto.randomUUID()
): TimelineItem {
    switch (type) {
        case "location": return new LocationItem({ id, type });
        case "dialogue": return new DialogueItem({ id, type });
        case "scene": return new SceneItem({ id, type });
        case "act": return new ActItem({ id, type });
        case "transition": return new TransitionItem({ id, type });
    }
}

export default function NewTimelineItemSelector() {
    const navigate = useNavigate();
    const params = useParams();
    const insertAtIndex = Number(params.pos ?? -1);

    const [type, setType] = createSignal<TimelineItemType>("dialogue");
    const [fields, setFields] = createSignal<Record<string, any>>({});
    const [duration, setDuration] = createSignal<number | undefined>(undefined);

    const types: { value: TimelineItemType; label: string }[] = [
        { value: "act", label: "Act" },
        { value: "dialogue", label: "Dialogue" },
        { value: "location", label: "Location" },
        { value: "scene", label: "Scene" },
        { value: "transition", label: "Transition" },
    ];

    const handleChange = (field: string, value: any) => {
        setFields(prev => ({ ...prev, [field]: value }));
    };

    const handleCreate = async () => {
        try {
            const item = await createTimelineItem(
                {
                    type: type(),
                    title: fields().title,
                    duration: duration(),
                    details: { ...fields() }
                },
                { insertAtIndex }
            );

            // Reset form
            setFields({});
            setDuration(undefined);
        } catch (err) {
            console.error("Failed to create timeline item:", err);
        }
    };

    // Render type-specific form
    const itemInstance = newTimelineItem(type());

    return (
        <fieldset class={`${styles.component} padding fill max surface-dim`} style={{ position: 'fixed', "max-width": "400px" }}>
            <legend class="surface-dim">
                <h3>Create a new item</h3>
            </legend>

            <div class="field border label">
                <select value={type()} onChange={e => setType(e.currentTarget.value as TimelineItemType)}>
                    <For each={types}>
                        {t => <option value={t.value}>{t.label}</option>}
                    </For>
                </select>
                <label>Type</label>
            </div>

            {itemInstance.renderCreateNew({
                onChange: handleChange,
                duration: duration()
            })}

            <div class="field border label top-margin" style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => navigate("/")} class="transparent">Cancel</button>
                <button onClick={handleCreate} class="primary">Create Timeline Item</button>
            </div>
        </fieldset>
    );
}
