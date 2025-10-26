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
