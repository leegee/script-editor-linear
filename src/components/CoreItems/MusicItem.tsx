import { TimelineItem, TimelineItemProps } from "./TimelineItem";

export class MusicItem extends TimelineItem {
    constructor(props: TimelineItemProps) {
        super({ ...props, type: "music" });
        this.details = {
            ...this.details,
            doesNotAdvanceTime: true,
        }
    }

}
