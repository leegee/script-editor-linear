import { createSignal, createMemo, For } from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";
import { createTimelineItem } from "../lib/createTimelineItem";
import { createTimelineItemInstance, timelineItemTypes } from "../lib/timelineItemRegistry";

type TimelineItemType = (typeof timelineItemTypes)[number];

/**
 * a select list that allows the user to create a new timeline item.
 */
export default function NewTimelineItemSelector() {
    const navigate = useNavigate();
    const params = useParams();
    const insertAtIndex = Number(params.pos ?? -1);

    const [type, setType] = createSignal<TimelineItemType>("dialogue");
    const [fields, setFields] = createSignal<Record<string, any>>({});
    const [duration, setDuration] = createSignal<number | undefined>(undefined);

    const types = timelineItemTypes.map(t => ({ value: t, label: t[0].toUpperCase() + t.slice(1) }));

    const handleChange = (field: string, value: any) => setFields(prev => ({ ...prev, [field]: value }));

    const handleCreate = async () => {
        try {
            const itemInstance = createTimelineItemInstance(type());
            const prepared = itemInstance.prepareFromFields({ ...fields(), duration: duration() });

            await createTimelineItem({ ...prepared, type: type() }, { insertAtIndex });

            setFields({});
            setDuration(undefined);
            navigate("/script");
        } catch (err) {
            console.error("Failed to create timeline item:", err);
        }
    };

    const itemInstance = createMemo(() => createTimelineItemInstance(type()));

    return (
        <article class="border padding">
            <header><h3>Create a new item</h3></header>

            <div class="field border label">
                <select value={type()} onChange={e => setType(e.currentTarget.value as typeof timelineItemTypes[number])}>
                    <For each={types}>{t => <option value={t.value}>{t.label}</option>}</For>
                </select>
                <label>Type</label>
            </div>

            {itemInstance().renderCreateNew({ onChange: handleChange, duration: duration() })}

            <hr />
            <footer class="field border label no-margin no-padding">
                <nav>
                    <button onClick={() => navigate("/script")} class="transparent">Cancel</button>
                    <button onClick={handleCreate} class="primary">Create Timeline Item</button>
                </nav>
            </footer>
        </article>
    );
}
