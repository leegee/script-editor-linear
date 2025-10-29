import { timelineItemClasses } from '../../lib/timelineItemRegistry';
import { TimelineLocationItem } from './Locations/TimelineLocationItem';
import { TimelineNoteItem } from './Notes/TimelineNoteItem';
import { TimelineItem } from './TimelineItem';

export * from './ActItem';
export * from './CharacterItem';
export * from './DialogueItem';
export * from './Locations/TimelineLocationItem';
export * from './Notes/TimelineNoteItem';
export * from './SceneItem';
export * from './Tag';
export * from './TimelineItem';
export * from './TransitionItem';

export function reviveItem(obj: any): TimelineItem {
    const Cls = timelineItemClasses[obj.type] ?? TimelineItem;
    return obj.type === "location"
        ? TimelineLocationItem.revive(obj)
        : obj.type === "note"
            ? TimelineNoteItem.revive(obj) : new Cls(obj);
}

