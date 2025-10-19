import { TimelineItemProps, TimelineItem, ActItem, SceneItem, DialogueItem, LocationItem, TransitionItem, reviveLocation } from "../components/CoreItems";
import { setTimelineItems, timelineItems, setTimelineSequence, timelineSequence, locations, setLocations } from "../stores";
import { storage } from "../db";

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
        title: props.title,
        duration: props.duration,
        details: props.details ?? {},
        tags: props.tags ?? [],
        notes: props.notes ?? []
    };

    // Handle missing location if needed
    if (props.type === "location" && props.title) {
        const locId = props.title;
        if (!locations[locId]) {
            if (options.createMissingLocation) {
                const placeholder = new LocationItem({
                    id: locId,
                    title: "Unnamed Location",
                    details: {
                        lat: 0, lng: 0, radius: 0
                    }
                });
                setLocations(locId, placeholder);
                await storage.put("locations", placeholder);
            } else {
                throw new Error(`Location "${locId}" does not exist`);
            }
        }
    }

    // Create the correct subclass
    let item: TimelineItem;
    switch (props.type) {
        case "act": item = new ActItem(baseProps); break;
        case "scene": item = new SceneItem(baseProps); break;
        case "dialogue": item = new DialogueItem(baseProps); break;
        case "transition": item = new TransitionItem(baseProps); break;
        case "location": item = reviveLocation(baseProps); break;
        default: item = new TimelineItem(baseProps);
    }

    // Add to timelineItems store
    setTimelineItems(item.id, item);
    await storage.put("timelineItems", item);

    // Update timeline sequence
    const seq = [...timelineSequence()];
    if (options.insertAtIndex !== undefined && options.insertAtIndex >= 0 && options.insertAtIndex <= seq.length) {
        seq.splice(options.insertAtIndex, 0, item.id);
    } else {
        seq.push(item.id); // append
    }
    setTimelineSequence(seq);
    await storage.putMeta("timelineSequence", seq);

    return item;
}

export async function deleteTimelineItem(itemId: string): Promise<void> {
    if (!timelineItems[itemId]) {
        console.warn(`Timeline item "${itemId}" does not exist`);
        return;
    }

    // Remove from timelineItems store
    setTimelineItems((items) => {
        const copy = { ...items };
        delete copy[itemId];
        return copy;
    });

    // Remove from timelineSequence
    const seq = [...timelineSequence()];
    const index = seq.indexOf(itemId);
    if (index !== -1) {
        seq.splice(index, 1);
        setTimelineSequence(seq);
        await storage.putMeta("timelineSequence", seq);
    }

    // Delete from storage
    await storage.delete("timelineItems", itemId);
}
