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

interface CreateTimelineItemOptions {
    insertAtIndex?: number;
    createMissingLocation?: boolean;
}

export async function createTimelineItem(
    props: Partial<TimelineItemProps> & { type: string },
    options: CreateTimelineItemOptions = {}
): Promise<TimelineItem> {
    const id = crypto.randomUUID();

    // Base props for all timeline items
    const baseProps: TimelineItemProps = {
        id,
        type: props.type,
        title: props.title ?? "",
        duration: props.duration,
        details: props.details ?? {},
        tags: props.tags ?? [],
        notes: props.notes ?? []
    };

    // Special case: LOCATION
    if (props.type === "location") {
        const ref = props.details?.ref;
        if (!ref) throw new Error(`Location timeline item missing details.ref`);

        if (!locations[ref]) {
            if (options.createMissingLocation) {
                const newLoc = new CanonicalLocation({
                    id: ref,
                    title: props.details?.title ?? "Untitled Location",
                    details: {
                        lat: props.details?.lat ?? 0,
                        lng: props.details?.lng ?? 0,
                        radius: props.details?.radius ?? 0
                    }
                });
                addLocation(newLoc);
            } else {
                throw new Error(`Location "${ref}" does not exist`);
            }
        }
    }

    // Instantiate the correct subclass
    let item: TimelineItem;
    switch (props.type) {
        case "act":
            item = new ActItem(baseProps);
            break;
        case "scene":
            item = new SceneItem(baseProps);
            break;
        case "dialogue":
            item = new DialogueItem(baseProps);
            break;
        case "transition":
            item = new TransitionItem(baseProps);
            break;
        case "location":
            item = TimelineLocationItem.revive(baseProps);
            break;
        default:
            item = new TimelineItem(baseProps);
    }

    // Create item via store (handles sequence append)
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
