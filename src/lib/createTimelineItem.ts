// lib/createTimelineItem.ts
import {
    TimelineItemProps,
    TimelineItem,
    ActItem,
    SceneItem,
    DialogueItem,
    TimelineLocationItem,
    TransitionItem
} from "../components/CoreItems";

import {
    timelineItems,
    locations,
    addLocation,
    createTimelineItem as storeCreateTimelineItem,
    deleteTimelineItem as storeDeleteTimelineItem,
} from "../stores";
import { CanonicalLocation } from "../components/CoreItems/Locations/CanonicalLocation";
import { timelineItemClasses } from "./timelineItemRegistry";

interface CreateTimelineItemOptions {
    insertAtIndex?: number;
    createMissingLocation?: boolean;
}

export async function createTimelineItem(
    props: Partial<TimelineItemProps> & { type: string },
    options: CreateTimelineItemOptions = {}
): Promise<TimelineItem> {
    const id = crypto.randomUUID();
    const baseProps: TimelineItemProps = {
        id,
        type: props.type,
        title: props.title ?? "",
        duration: props.duration,
        details: props.details ?? {},
        tags: props.tags ?? [],
        notes: props.notes ?? []
    };

    // Special case: LOCATION creation / validation
    if (props.type === "location") {
        const ref = baseProps.details?.ref;
        if (!ref) throw new Error("Location item missing details.ref");
        if (!locations[ref]) {
            if (options.createMissingLocation) {
                if (!baseProps.details) {
                    throw new TypeError("Location requires details");
                }
                const newLoc = new CanonicalLocation({
                    id: ref,
                    title: baseProps.title || "Untitled Location",
                    details: {
                        lat: baseProps.details.lat ?? 0,
                        lng: baseProps.details.lng ?? 0,
                        radius: baseProps.details.radius ?? 100
                    }
                });
                addLocation(newLoc);
            } else {
                throw new Error(`Unknown location ref: ${ref}`);
            }
        }
    }

    const Cls = timelineItemClasses[props.type] ?? TimelineItem;
    const item =
        props.type === "location"
            ? TimelineLocationItem.revive(baseProps)
            : new Cls(baseProps);

    await storeCreateTimelineItem(item, options.insertAtIndex);
    return item;
}

/**
 * Delete a timeline item by ID using store API
 */
export async function deleteTimelineItemById(itemId: string): Promise<void> {
    if (!timelineItems[itemId]) {
        console.warn(`Timeline item "${itemId}" does not exist`);
        return;
    }

    await storeDeleteTimelineItem(itemId);
}
