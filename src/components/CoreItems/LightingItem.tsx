import { TimelineItem, TimelineItemProps } from "./TimelineItem";

export class LightingItem extends TimelineItem {
    constructor(props: TimelineItemProps) {
        super({ ...props, type: "lighting" });
        this.details = {
            ...this.details,
            doesNotAdvanceTime: true,
        }
    }

}
