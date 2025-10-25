import { type JSX } from "solid-js";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";

export class MusicItem extends TimelineItem {
    constructor(props: TimelineItemProps) {
        super({ ...props, type: "music" });
        this.details = {
            ...this.details,
            doesNotAdvanceTime: true,
        }
    }

    timelineContent(zoom: number): JSX.Element | string | undefined {
        return <i>music_note</i>;
    }
}
