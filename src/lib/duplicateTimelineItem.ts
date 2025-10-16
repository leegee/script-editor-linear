import { TimelineItem, TimelineItemProps } from "../components/CoreItems";
import { timelineItems } from "../stores";
import { createTimelineItem } from "./createTimelineItem";

/**
 * Duplicate a TimelineItem, inserting it after the original (or at a specified index).
 * - If original has a duration, new item's startTime = original.startTime + original.duration
 * - Optionally create missing location placeholders
 */
interface DuplicateTimelineItemOptions {
    insertAtIndex?: number;
    createMissingLocation?: boolean;
}

export async function duplicateTimelineItem(
    itemId: string,
    options: DuplicateTimelineItemOptions = {}
): Promise<TimelineItem> {
    const original = timelineItems[itemId];
    if (!original) throw new Error(`TimelineItem "${itemId}" not found`);

    const newStartTime = (original.startTime ?? 0) + (original.duration ?? 0);

    const props: Partial<TimelineItemProps> & { type: string } = {
        type: original.type,
        title: original.title,
        startTime: newStartTime,
        duration: original.duration,
        details: { ...original.details },
        tags: [...(original.tags ?? [])],
        notes: [...(original.notes ?? [])]
    };

    const newItem = await createTimelineItem(props, options);
    return newItem;
}
