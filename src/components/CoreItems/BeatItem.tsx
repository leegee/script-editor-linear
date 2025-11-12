import { type JSX } from "solid-js";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";

export class BeatItem extends TimelineItem {
    _icon = "swipe_down_alt";

    constructor(props: TimelineItemProps) {
        super({ ...props, type: "beat" });
        this.details = {
            ...this.details,
            doesNotAdvanceTime: true,
        }
    }

}
