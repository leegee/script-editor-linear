import { type JSX } from 'solid-js';
import { TimelineItem, TimelineItemProps } from "./TimelineItem";

export class CameraItem extends TimelineItem {
    _icon = "camera";

    constructor(props: TimelineItemProps) {
        super({ ...props, type: "camera" });
        this.details = {
            ...this.details,
            doesNotAdvanceTime: true,
        }
    }

}
