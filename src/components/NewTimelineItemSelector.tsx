import { createSignal, createEffect, JSX, For } from "solid-js";
import { createTimelineItem } from "../lib/createTimelineItem";
import { timelineSequence, timelineItems, locations } from "../stores";
import type { LocationItem } from "../components/CoreItems";

interface NewTimelineItemSelectorProps {
    insertAtIndex: number;
    onCreated?: (id: string) => void;
    onCancel: () => void;
}

export default function NewTimelineItemSelector(props: NewTimelineItemSelectorProps) {
    const [type, setType] = createSignal<"act" | "scene" | "dialogue" | "location">("dialogue");
    const [title, setTitle] = createSignal("");
    const [selectedLocation, setSelectedLocation] = createSignal<string | undefined>(undefined);
    const [startTime, setStartTime] = createSignal<number | undefined>(undefined);
    const [duration, setDuration] = createSignal<number | undefined>(undefined);
    const [defaultStartTime, setDefaultStartTime] = createSignal<number | undefined>(undefined);

    const types: { value: "act" | "scene" | "dialogue" | "location"; label: string }[] = [
        { value: "act", label: "Act" },
        { value: "scene", label: "Scene" },
        { value: "dialogue", label: "Dialogue" },
        { value: "location", label: "Location" },
    ];

    // Compute default startTime based on previous item
    createEffect(() => {
        const seq = timelineSequence();
        if (props.insertAtIndex > 0 && seq[props.insertAtIndex - 1]) {
            const prevId = seq[props.insertAtIndex - 1];
            const prevItem = timelineItems[prevId];
            if (prevItem?.startTime != null && prevItem?.duration != null) {
                const prevEnd = prevItem.startTime + prevItem.duration;
                setDefaultStartTime(prevEnd);
                if (startTime() == null) setStartTime(prevEnd);
            }
        } else if (startTime() == null) {
            setStartTime(0);
            setDefaultStartTime(0);
        }
    });

    const handleCreate = async () => {
        try {
            const item = await createTimelineItem(
                {
                    type: type(),
                    title: type() === "location" ? locations[selectedLocation()!]?.title : title(),
                    startTime: startTime(),
                    duration: duration(),
                    details: type() === "location" && selectedLocation() ? { locationId: selectedLocation() } : undefined
                },
                { insertAtIndex: props.insertAtIndex }
            );

            // Reset form
            setTitle("");
            setSelectedLocation(undefined);
            setStartTime(defaultStartTime());
            setDuration(undefined);

            props.onCreated?.(item.id);
        } catch (err) {
            console.error("Failed to create timeline item:", err);
        }
    };

    return (
        <fieldset class="padding surface-dim" style={{ position: 'fixed' }}>
            <legend class="surface-dim">
                <h3 class="surface-dim">Create a new item</h3>
            </legend>

            <div class="field border label">
                <select value={type()} onChange={(e) => setType(e.currentTarget.value as any)}>
                    <For each={types}>
                        {(t) => <option value={t.value}>{t.label}</option>}
                    </For>
                </select>
                <label>Type</label>
            </div>

            {type() === "location" ? (
                <div class="field border label">
                    <select
                        value={selectedLocation() ?? ""}
                        onChange={(e) => setSelectedLocation(e.currentTarget.value)}
                    >
                        <option value="" disabled>Select a location</option>
                        <For each={Object.values(locations)}>
                            {(loc: LocationItem) => <option value={loc.id}>{loc.title}</option>}
                        </For>
                    </select>
                    <label>Location</label>
                </div>
            ) : (
                <div class="field border label">
                    <input type="text" value={title()} onInput={(e) => setTitle(e.currentTarget.value)} />
                    <label>Title</label>
                </div>
            )}

            <div class="field border label">
                <input
                    type="number"
                    min={0}
                    value={startTime() ?? ""}
                    onInput={(e) => setStartTime(e.currentTarget.value ? Number(e.currentTarget.value) : undefined)}
                />
                <label>Start Time (seconds)</label>
            </div>

            {type() !== "location" && (
                <div class="field border label">
                    <input
                        type="number"
                        min={0}
                        value={duration() ?? ""}
                        onInput={(e) => setDuration(e.currentTarget.value ? Number(e.currentTarget.value) : undefined)}
                    />
                    <label>Duration (seconds)</label>
                </div>
            )}

            <div class="field border label">
                <button onClick={() => props.onCancel()} class="transparent">Cancel</button>
                <button onClick={handleCreate} class="primary">Create Timeline Item</button>
            </div>
        </fieldset>
    );
}
