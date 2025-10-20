import { ActItem } from './ActItem';
import { DialogueItem } from './DialogueItem';
import { LocationItem } from './LocationItem';
import { SceneItem } from './SceneItem';
import { TimelineItem } from './TimelineItem';
import { TransitionItem } from './TransitionItem';

export * from './ActItem';
export * from './CharacterItem';
export * from './DialogueItem';
export * from './LocationItem';
export * from './Note';
export * from './SceneItem';
export * from './Tag';
export * from './TimelineItem';
export * from './TransitionItem';

export function reviveItem(obj: any): TimelineItem {
    switch (obj.type) {
        case "act": return new ActItem(obj);
        case "scene": return new SceneItem(obj);
        case "dialogue": return new DialogueItem(obj);
        case "transition": return new TransitionItem(obj);
        case "location": return LocationItem.revive(obj);
        default: return new TimelineItem(obj);
    }
}

