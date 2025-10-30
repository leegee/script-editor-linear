import { type JSX } from "solid-js";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";

export class BeatItem extends TimelineItem {
    constructor(props: TimelineItemProps) {
        super({ ...props, type: "beat" });
        this.details = {
            ...this.details,
            doesNotAdvanceTime: true,
        }
    }

    timelineContent(zoom: number): JSX.Element | string | undefined {
        return <i>swipe_down_alt</i>;
    }

}
