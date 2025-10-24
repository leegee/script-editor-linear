import { ActItem } from './ActItem';
import { CameraItem } from './CameraItem';
import { DialogueItem } from './DialogueItem';
import { LightingItem } from './LightingItem';
import { TimelineLocationItem } from './Locations/TimelineLocationItem';
import { SceneItem } from './SceneItem';
import { SoundItem } from './SoundItem';
import { TimelineItem } from './TimelineItem';
import { TransitionItem } from './TransitionItem';

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
    switch (obj.type) {
        case "act": return new ActItem(obj);
        case "scene": return new SceneItem(obj);
        case "dialogue": return new DialogueItem(obj);
        case "transition": return new TransitionItem(obj);
        case "location": return TimelineLocationItem.revive(obj);
        case "sound": return new SoundItem(obj);
        case "camera": return new CameraItem(obj);
        case "lighting": return new LightingItem(obj);
        default: return new TimelineItem(obj);
    }
}

