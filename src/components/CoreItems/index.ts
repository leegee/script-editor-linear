import { type JSX } from "solid-js";
import { timelineItemClasses } from '../../lib/timelineItemRegistry';
import { TimelineLocationItem } from './Locations/TimelineLocationItem';
import { TimelineItem } from './TimelineItem';

export * from './ActItem';
export * from './CharacterItem';
export * from './DialogueItem';
export * from './Locations/TimelineLocationItem';
export * from './Note';
export * from './SceneItem';
export * from './Tag';
export * from './TimelineItem';
export * from './TransitionItem';

export function reviveItem(obj: any): TimelineItem {
    const Cls = timelineItemClasses[obj.type] ?? TimelineItem;
    return obj.type === "location"
        ? TimelineLocationItem.revive(obj)
        : new Cls(obj);
}

