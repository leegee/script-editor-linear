import { createStore } from "solid-js/store";
import { createSignal, createMemo } from "solid-js";
import { TimelineItem, TimelineItemProps, reviveItem } from "../components/CoreItems/";
import { storage } from "../db";
import { locations } from "./locations";

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
    // Validate location refs
    if (item.type === "location") {
        const ref = item.details?.ref;
        if (!ref) {
            console.error("Location item missing details.ref", item);
            throw new TypeError(`Cannot add location: details.ref is missing for item "${item.id}".`);
        }
        if (!locations[ref]) {
            console.error("Location ref not found in store", item, ref);
            throw new TypeError(`Cannot add location: ref "${ref}" does not exist in locations store.`);
        }
    }

    // Add item to timeline store
    setTimelineItems(item.id, item);

    // Update timeline sequence
    const seq = [...timelineSequence()];
    if (insertAtIndex !== undefined && insertAtIndex >= 0 && insertAtIndex <= seq.length) {
        seq.splice(insertAtIndex, 0, item.id);
    } else {
        seq.push(item.id);
    }
    setTimelineSequence(seq);

    // Persist to storage
    await storage.put("timelineItems", item);
    await storage.putMeta("timelineSequence", seq);

    console.log(`TimelineItem added: ${item.type} ${item.id}`);
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
    let act = 0;

    // First pass: compute absolute start times and advance now for items with duration
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const start = now;
        let body: Record<string, string> = { ...item.details };

        if (item.type === 'act') act++;
        if (item.type === 'scene') {
            body.title = 'Act ' + act + ', ' + item.title;
        };

        // Clone item with start in details (duration may be undefined)
        const newItem = item.cloneWith({
            ...body,
            details: { ...item.details, start },
        });

        result.push(newItem);

        // Advance 'now' if item has duration
        if (!item.details.doesNotAdvanceTime) {
            now = start + (item.duration ?? 0);
        }
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
                : totalDuration;
            const duration = end - item.details.start;

            result[i] = item.cloneWith({
                details: { ...item.details, end: end },
                duration,
            });
        }
    }

    return result;
});


function _collectStartTimes(containerType: "act" | "scene") {
    return createMemo(() => {
        const starts: Record<string, number> = {};
        let currentStart = 0;

        for (const item of orderedItems()) {
            if (item.type === containerType) {
                starts[item.id] = currentStart;
                currentStart += item.duration ?? 0;
            }
        }

        return starts;
    });
}


function _collectDurations(containerType: "act" | "scene") {
    return createMemo(() => {
        const result: Record<string, number> = {};
        let currentId: string | null = null;
        let sum = 0;

        for (const item of orderedItems()) {
            if (item.type === containerType) {
                if (currentId) result[currentId] = sum;
                currentId = item.id;
                sum = item.duration ?? 0;
            } else if (currentId) {
                sum += item.duration ?? 0;
            }
        }

        if (currentId) result[currentId] = sum;
        return result;
    });
}

function _collectCharacters(containerType: "act" | "scene") {
    return createMemo(() => {
        const result: Record<string, Set<string>> = {};
        let currentId: string | null = null;
        let charIds: Set<string> = new Set();

        for (const item of orderedItems()) {
            if (item.type === containerType) {
                if (currentId) result[currentId] = new Set(charIds);
                currentId = item.id;
                charIds = new Set();
            } else if (currentId && item.type === "dialogue") {
                charIds.add(item.details.ref);
            }
        }

        if (currentId) result[currentId] = new Set(charIds);
        return result;
    });
}


function _collectLocationRefs(containerType: "act" | "scene") {
    return createMemo(() => {
        const result: Record<string, Set<string>> = {};
        let currentContainerId: string | null = null;
        let locIds = new Set<string>();

        for (const item of orderedItems()) {
            if (item.type === containerType) {
                // Save collected locations for the previous container
                if (currentContainerId) result[currentContainerId] = new Set(locIds);

                // Start new container
                currentContainerId = item.id;
                locIds = new Set();
            }
            // Collect location refs for current container
            else if (currentContainerId && item.type === "location") {
                if (item.details?.ref) {
                    locIds.add(item.details.ref);
                } else {
                    throw new TypeError('No details.ref in location');
                }
            }
        }

        // Save the last container
        if (currentContainerId) result[currentContainerId] = new Set(locIds);

        return result;
    });
}


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


export const actCharacters = _collectCharacters("act");
export const sceneCharacters = _collectCharacters("scene");

export const sceneLocations = _collectLocationRefs("scene");
export const actLocations = _collectLocationRefs("act");

export const actStartTimes = _collectStartTimes("act");
export const sceneStartTimes = _collectStartTimes("scene");

export const actDurations = _collectDurations("act");
export const sceneDurations = _collectDurations("scene");
