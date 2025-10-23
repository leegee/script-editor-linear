import { createStore } from "solid-js/store";
import { createSignal, createMemo } from "solid-js";
import { TimelineItem, TimelineItemProps, reviveItem } from "../components/CoreItems/";
import { storage } from "../db";

const [timelineItems, setTimelineItems] = createStore<Record<string, TimelineItem>>({});
const [timelineSequence, setTimelineSequence] = createSignal<string[]>([]);

export { timelineItems, timelineSequence };

// CRUD API

export async function loadAllTimelineItems() {
    const items = await storage.getAll<TimelineItemProps>("timelineItems");
    const revived = Object.fromEntries(
        Object.entries(items).map(([id, props]) => [id, reviveItem(props)])
    );
    setTimelineItems(revived);

    const savedSeq = await storage.getMeta<string[]>("timelineSequence");
    if (savedSeq?.length) setTimelineSequence(savedSeq);
}

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

export async function replaceTimelineItem(id: string, newItem: TimelineItem) {
    setTimelineItems(id, newItem);
    await storage.put("timelineItems", newItem);
}

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
 * Update a property on a timeline item with reactivity
 */
export async function updateTimelineItem(
    id: string,
    path: "details" | "title" | "duration",
    key: string,
    value: any
) {
    const item = timelineItems[id];
    const newItem = item.cloneWith(
        path === "details"
            ? { details: { ...item.details, [key]: value } }
            : { [path]: value }
    );

    setTimelineItems(item.id, newItem);
    await storage.put("timelineItems", newItem);
}

export async function reorderTimeline(newSeq: string[]) {
    setTimelineSequence(newSeq);
    await storage.putMeta("timelineSequence", newSeq);
}

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

export async function deleteAllTimelineItems() {
    setTimelineItems({});
    setTimelineSequence([]);
    await storage.clearTable("timelineItems");
    await storage.putMeta("timelineSequence", []);
}

// Derived memos

export const orderedItems = createMemo(() => {
    const items = timelineSequence()
        .map(id => timelineItems[id])
        .filter((item): item is TimelineItem => !!item);

    const result: TimelineItem[] = [];
    let now = 0;

    // First pass: compute absolute start times and advance now for items with duration
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const start = now;

        // Clone item with start in details (duration may be undefined)
        const newItem = item.cloneWith({
            details: { ...item.details, start },
        });

        result.push(newItem);

        // Advance 'now' if item has duration
        now = start + (item.duration ?? 0);
    }

    const totalDuration = now;

    // Second pass: compute implicit durations for event markers (act, scene, beat)
    for (let i = 0; i < result.length; i++) {
        const item = result[i];

        if (item.duration == null) {
            const nextSameTypeIndex = result.slice(i + 1).findIndex(n => n.type === item.type);
            const nextIndex = nextSameTypeIndex >= 0 ? i + 1 + nextSameTypeIndex : result.length;
            const end = nextIndex < result.length
                ? result[nextIndex].details.start
                : totalDuration; // <-- use totalDuration if last of type
            const duration = end - item.details.start;

            result[i] = item.cloneWith({
                details: { ...item.details, end: end },
                duration,
            });
        }
    }

    return result;
});


// Should consolidate all the time processes into one
export const actStartTimes = createMemo(() => {
    const starts: Record<string, number> = {};
    let currentStart = 0;

    for (const item of orderedItems()) {
        if (item.type === "act") {
            starts[item.id] = currentStart;
            currentStart += item.duration ?? 0;
        }
    }

    return starts;
});

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

export const sceneStartTimes = createMemo(() => {
    const starts: Record<string, number> = {};
    let currentStart = 0;

    for (const item of orderedItems()) {
        if (item.type === "scene") {
            starts[item.id] = currentStart;
            currentStart += item.duration ?? 0;
        }
    }

    return starts;
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

export const sceneCharacters = createMemo(() => {
    const scenes: Record<string, Set<string>> = {};
    let currentSceneId: string | null = null;
    let charIds: Set<string> = new Set();

    for (const item of orderedItems()) {
        if (item.type === "scene") {
            if (currentSceneId) scenes[currentSceneId] = new Set(charIds);
            currentSceneId = item.id;
            charIds = new Set();
        } else if (currentSceneId && item.type === 'dialogue') {
            charIds.add(item.details.characterId);
        }
    }

    if (currentSceneId) scenes[currentSceneId] = new Set(charIds);
    return scenes;
});

export const sceneLocations = createMemo(() => {
    const scenes: Record<string, Set<string>> = {};
    let currentSceneId: string | null = null;
    let locIds: Set<string> = new Set();

    for (const item of orderedItems()) {
        if (item.type === "scene") {
            if (currentSceneId) scenes[currentSceneId] = new Set(locIds);
            currentSceneId = item.id;
            locIds = new Set();
        } else if (currentSceneId && item.type === 'location') {
            locIds.add(item.details.ref);
        }
    }

    if (currentSceneId) scenes[currentSceneId] = new Set(locIds);
    return scenes;
});

export const timelineitemStartTimes = createMemo(() => {
    const starts: Record<string, number> = {};
    let currentStart = 0;

    for (const item of orderedItems()) {
        if (item.type === "scene") {
            starts[item.id] = currentStart;
            currentStart += item.duration ?? 0;
        }
    }

    return starts;
});
