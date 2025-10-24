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

export const timelineItemClasses: Record<string, typeof TimelineItem> = {
    act: ActItem,
    scene: SceneItem,
    dialogue: DialogueItem,
    transition: TransitionItem,
    location: TimelineLocationItem,
    soundfx: SoundFxItem,
    music: MusicItem,
    camera: CameraItem,
    lighting: LightingItem
};
