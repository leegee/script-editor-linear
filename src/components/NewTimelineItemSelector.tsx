import styles from './NewTimelineItemSelector.module.scss';
import { createSignal, createMemo, For } from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";
import { createTimelineItem } from "../lib/createTimelineItem";
import { ActItem, SceneItem, DialogueItem, TimelineLocationItem, TransitionItem, TimelineItem } from "../components/CoreItems";

export type TimelineItemType = "act" | "scene" | "dialogue" | "location" | "transition";

function newTimelineItem(type: TimelineItemType, id = crypto.randomUUID()): TimelineItem {
    switch (type) {
        case "location": return new TimelineLocationItem({ id });
        case "dialogue": return new DialogueItem({ id });
        case "scene": return new SceneItem({ id });
        case "act": return new ActItem({ id });
        case "transition": return new TransitionItem({ id });
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
            // Create a temporary instance of the right subclass
            const itemInstance = newTimelineItem(type());

            // Use reflection-based instance method to split fields
            const prepared = itemInstance.prepareFromFields({ ...fields(), duration: duration() });

            await createTimelineItem(
                {
                    ...prepared,
                    type: type()
                },
                { insertAtIndex }
            );

            // Reset form
            setFields({});
            setDuration(undefined);
            navigate("/");
        } catch (err) {
            console.error("Failed to create timeline item:", err);
        }
    };

    const itemInstance = createMemo(() => newTimelineItem(type()));

    return (
        <article>
            <fieldset class={styles.component + " padding"} style={{ position: 'fixed', "max-width": "400px" }}>
                <header>
                    <h3>Create a new item</h3>
                </header>

                <div class="field border label">
                    <select value={type()} onChange={e => setType(e.currentTarget.value as TimelineItemType)}>
                        <For each={types}>
                            {t => <option value={t.value}>{t.label}</option>}
                        </For>
                    </select>
                    <label>Type</label>
                </div>

                {itemInstance().renderCreateNew({
                    onChange: handleChange,
                    duration: duration()
                })}

                <div class="field border label top-margin" style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => navigate("/")} class="transparent">Cancel</button>
                    <button onClick={handleCreate} class="primary">Create Timeline Item</button>
                </div>
            </fieldset>
        </article>
    );
}
