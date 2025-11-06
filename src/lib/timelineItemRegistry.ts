import { TimelineItem } from "../components/CoreItems/TimelineItem";
import { ActItem } from "../components/CoreItems/ActItem";
import { SceneItem } from "../components/CoreItems/SceneItem";
import { DialogueItem } from "../components/CoreItems/DialogueItem";
import { TransitionItem } from "../components/CoreItems/TransitionItem";
import { TimelineLocationItem } from "../components/CoreItems/Locations/TimelineLocationItem";
import { CameraItem } from "../components/CoreItems/CameraItem";
import { LightingItem } from "../components/CoreItems/LightingItem";
import { SoundFxItem } from "../components/CoreItems/SoundFxItem";
import { MusicItem } from "../components/CoreItems/MusicItem";
import { ActionItem } from "../components/CoreItems/ActionItem";
import { BeatItem } from "../components/CoreItems/BeatItem";
import { PauseItem } from "../components/CoreItems/PauseItem";

// The central registry of Timeine Item sub-classes
export const timelineItemClasses: Record<string, typeof TimelineItem> = {
    act: ActItem,
    action: ActionItem,
    beat: BeatItem,
    camera: CameraItem,
    dialogue: DialogueItem,
    lighting: LightingItem,
    location: TimelineLocationItem,
    music: MusicItem,
    pause: PauseItem,
    scene: SceneItem,
    soundfx: SoundFxItem,
    transition: TransitionItem,
};

// Get all type keys
export type TimelineItemTypeType = keyof typeof timelineItemClasses;
export const timelineItemTypes = Object.keys(timelineItemClasses) as TimelineItemTypeType[];

// Types the user can enter in typing view
export type TimelineItemUpper = Uppercase<TimelineItemTypeType>;

export const timelineItemTypesForTyping = Object.keys(timelineItemClasses)
    .map(k => k.toUpperCase()) as TimelineItemUpper[];

// Factory to create instance of any type
export function createTimelineItemInstance<T extends TimelineItemTypeType>(
    type: T,
    id = crypto.randomUUID()
): InstanceType<typeof timelineItemClasses[T]> {
    const Klass = timelineItemClasses[type];
    return new Klass({ id, type }) as InstanceType<typeof timelineItemClasses[T]>;
}
