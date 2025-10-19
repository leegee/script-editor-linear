import { TimelineItem, TimelineItemProps } from "../components/CoreItems";
import { timelineItems } from "../stores";
import { createTimelineItem } from "./createTimelineItem";

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

    const props: Partial<TimelineItemProps> & { type: string } = {
        type: original.type,
        title: original.title,
        duration: original.duration,
        details: { ...original.details },
        tags: [...(original.tags ?? [])],
        notes: [...(original.notes ?? [])]
    };

    const newItem = await createTimelineItem(props, options);
    return newItem;
}
