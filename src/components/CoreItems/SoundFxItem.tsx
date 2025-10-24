import { TimelineItem, TimelineItemProps } from "./TimelineItem";

export class SoundFxItem extends TimelineItem {
    constructor(props: TimelineItemProps) {
        super({ ...props, type: "soundfx" });
        this.details = {
            ...this.details,
            doesNotAdvanceTime: true,
        }
    }

}
