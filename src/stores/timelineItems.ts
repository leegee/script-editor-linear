import { createStore } from "solid-js/store";
import { createSignal, createMemo } from "solid-js";
import { TimelineItem, TimelineItemProps, reviveItem } from "../components/CoreItems/";
import { storage } from "../db";

const [timelineItems, setTimelineItems] = createStore<Record<string, TimelineItem>>({});
const [timelineSequence, setTimelineSequence] = createSignal<string[]>([]);

export { timelineItems, timelineSequence };

// Ordered items derived
export const orderedItems = createMemo(() =>
    timelineSequence().map(id => timelineItems[id]).filter((item): item is TimelineItem => !!item)
);

// CRUD API

/**
 * Load all timeline items from storage
 */
export async function loadAllTimelineItems() {
    const items = await storage.getAll<TimelineItemProps>("timelineItems");
    const revived = Object.fromEntries(
        Object.entries(items).map(([id, props]) => [id, reviveItem(props)])
    );
    setTimelineItems(revived);

    const savedSeq = await storage.getMeta<string[]>("timelineSequence");
    if (savedSeq?.length) setTimelineSequence(savedSeq);
}

/**
 * Create a timeline item and insert at optional index
 */
export async function createTimelineItem(item: TimelineItem, insertAtIndex?: number) {
    setTimelineItems(item.id, item);

    const seq = [...timelineSequence()];
    if (insertAtIndex !== undefined && insertAtIndex >= 0 && insertAtIndex <= seq.length) {
        seq.splice(insertAtIndex, 0, item.id);
    } else {
        seq.push(item.id);
    }

    setTimelineSequence(seq);

    await storage.put("timelineItems", item);
    await storage.putMeta("timelineSequence", seq);
}

/**
 * Replace an existing timeline item (sequence unchanged)
 */
export async function replaceTimelineItem(id: string, newItem: TimelineItem) {
    setTimelineItems(id, newItem);
    await storage.put("timelineItems", newItem);
}

/**
 * Duplicate a timeline item and insert after original or at index
 */
export async function duplicateTimelineItem(originalId: string, newItem: TimelineItem, insertAtIndex?: number) {
    const seq = [...timelineSequence()];
    const index = insertAtIndex ?? seq.findIndex(id => id === originalId) + 1;
    seq.splice(index, 0, newItem.id);

    setTimelineItems(newItem.id, newItem);
    setTimelineSequence(seq);

    await storage.put("timelineItems", newItem);
    await storage.putMeta("timelineSequence", seq);
}

/**
 * Update a property on a timeline item
 */
export async function updateTimelineItem(
    item: TimelineItem,
    path: "details" | "title" | "duration",
    key: string,
    value: any
) {
    if (path === "details") {
        const newDetails = { ...item.details, [key]: value };  // replace object
        item.details = newDetails;
        setTimelineItems(item.id, "details", newDetails);      // triggers reactivity
    } else {
        (item as any)[path] = value;
        setTimelineItems(item.id, path, value);
    }

    await storage.put("timelineItems", item);
}



/**
 * Reorder timeline sequence
 */
export async function reorderTimeline(newSeq: string[]) {
    setTimelineSequence(newSeq);
    await storage.putMeta("timelineSequence", newSeq);
}

/**
 * Delete a timeline item (also removes from sequence)
 */
export async function deleteTimelineItem(id: string) {
    if (!timelineItems[id]) return;

    setTimelineItems(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
    });

    setTimelineSequence(seq => seq.filter(x => x !== id));

    await storage.delete("timelineItems", id);
    await storage.putMeta("timelineSequence", timelineSequence());
}

/**
 * Delete all timeline items and reset sequence
 */
export async function deleteAllTimelineItems() {
    setTimelineItems({});
    setTimelineSequence([]);
    await storage.clearTable("timelineItems");
    await storage.putMeta("timelineSequence", []);
}

// Derived memos

export const actDurations = createMemo(() => {
    const acts: Record<string, number> = {};
    let currentActId: string | null = null;
    let sum = 0;

    for (const item of orderedItems()) {
        if (item.type === "act") {
            if (currentActId) acts[currentActId] = sum;
            currentActId = item.id;
            sum = item.duration ?? 0;
        } else if (currentActId) {
            sum += item.duration ?? 0;
        }
    }

    if (currentActId) acts[currentActId] = sum;
    return acts;
});

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
