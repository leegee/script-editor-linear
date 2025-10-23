import { TimelineItem, TimelineItemProps } from "./TimelineItem";

export class SoundItem extends TimelineItem {
    constructor(props: TimelineItemProps) {
        super({ ...props, type: "sound" });
        this.details = {
            ...this.details,
            doesNotAdvanceTime: true,
        }
    }

}
