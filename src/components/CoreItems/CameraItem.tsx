import { TimelineItem, TimelineItemProps } from "./TimelineItem";

export class CameraItem extends TimelineItem {
    constructor(props: TimelineItemProps) {
        super({ ...props, type: "camera" });
        this.details = {
            ...this.details,
            doesNotAdvanceTime: true,
        }
    }

}
