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

    // Special case: LOCATION ---
    if (props.type === "location") {
        const ref = props.details?.ref;

        if (!ref) {
            throw new Error(`Location timeline item missing details.ref`);
        }

        // Create placeholder or actual location if missing
        if (!locations[ref]) {
            if (options.createMissingLocation) {
                const newLoc = new LocationItem({
                    id: ref,
                    title: props.details?.title ?? "Untitled Location",
                    details: {
                        lat: props.details?.lat ?? 0,
                        lng: props.details?.lng ?? 0,
                        radius: props.details?.radius ?? 0
                    }
                });
                setLocations(ref, newLoc);
                await storage.put("locations", newLoc);
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
            item = reviveLocation(baseProps);
            break;
        default:
            item = new TimelineItem(baseProps);
    }

    // persist
    setTimelineItems(item.id, item);
    await storage.put("timelineItems", item);

    // Insert into timeline sequence ---
    const seq = [...timelineSequence()];
    if (
        options.insertAtIndex !== undefined &&
        options.insertAtIndex >= 0 &&
        options.insertAtIndex <= seq.length
    ) {
        seq.splice(options.insertAtIndex, 0, item.id);
    } else {
        seq.push(item.id);
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
