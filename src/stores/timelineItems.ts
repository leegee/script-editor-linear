import { createStore } from "solid-js/store";
import { createSignal, createMemo } from "solid-js";
import { TimelineItem, TimelineItemProps, reviveItem } from "../components/CoreItems/";
import { storage } from "../db";

export const [timelineItems, setTimelineItems] = createStore<Record<string, TimelineItem>>({});
export const [timelineSequence, setTimelineSequence] = createSignal<string[]>([]);

// Load all timeline items
export async function loadAllTimelineItems() {
    const items = await storage.getAll<TimelineItemProps>("timelineItems");
    const revived = Object.fromEntries(
        Object.entries(items).map(([id, props]) => [id, reviveItem(props)])
    );
    setTimelineItems(revived);

    const savedSeq = await storage.getMeta<string[]>("timelineSequence");
    if (savedSeq && savedSeq.length) setTimelineSequence(savedSeq);
}

const orderedItems = createMemo(() => {
    return timelineSequence()
        .map(id => timelineItems[id]) // reactive read of each id
        .filter((item): item is TimelineItem => !!item); // filter out undefined
});

// CRUD:
export async function addScriptItem(item: TimelineItem) {
    setTimelineItems(item.id, item);
    const seq = [...timelineSequence(), item.id];
    setTimelineSequence(seq);
    await storage.put("timelineItems", item);
    await storage.putMeta("timelineSequence", seq);
}

export async function reorderTimeline(newSeq: string[]) {
    setTimelineSequence(newSeq);
    await storage.putMeta("timelineSequence", newSeq);
}

export async function removeTimelineItem(id: string) {
    setTimelineItems(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
    });
    setTimelineSequence(timelineSequence().filter(x => x !== id));
    await storage.delete("timelineItems", id);
}

// Derived:

// Cumulative durations per act
export const actDurations = createMemo(() => {
    const acts: Record<string, number> = {};
    let currentActId: string | null = null;
    let sum = 0;

    for (const item of orderedItems()) {
        if (item.type === "act") {
            // Save previous act duration
            if (currentActId) acts[currentActId] = sum;

            // Start new act
            currentActId = item.id;
            sum = item.duration ?? 0;
        } else if (currentActId) {
            sum += item.duration ?? 0;
        }
    }

    // Save last act
    if (currentActId) acts[currentActId] = sum;

    return acts;
});

// Reactive cumulative durations per scene
export const sceneDurations = createMemo(() => {
    const scenes: Record<string, number> = {};
    let currentSceneId: string | null = null;
    let sum = 0;

    for (const item of orderedItems()) {
        if (item.type === "scene") {
            if (currentSceneId) scenes[currentSceneId] = sum;
            currentSceneId = item.id;
            sum = item.duration ?? 0;
        } else if (currentSceneId) {
            sum += item.duration ?? 0;
        }
    }

    if (currentSceneId) scenes[currentSceneId] = sum;

    return scenes;
});
