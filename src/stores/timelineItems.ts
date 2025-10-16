import { createStore } from "solid-js/store";
import { createSignal } from "solid-js";
import { TimelineItem, TimelineItemProps, reviveItem } from "../classes/CoreItems";
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

// CRUD
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
