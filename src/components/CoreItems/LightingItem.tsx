import { type JSX } from "solid-js";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";

export class LightingItem extends TimelineItem {
    _icon = "brightness_6";

    constructor(props: TimelineItemProps) {
        super({ ...props, type: "lighting" });
        this.details = {
            ...this.details,
            doesNotAdvanceTime: true,
        }
    }

}
