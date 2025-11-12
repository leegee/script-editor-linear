import { type JSX } from "solid-js";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";

export class MusicItem extends TimelineItem {
    _icon = "music_note";

    constructor(props: TimelineItemProps) {
        super({ ...props, type: "music" });
        this.details = {
            ...this.details,
            doesNotAdvanceTime: true,
        }
    }
}
