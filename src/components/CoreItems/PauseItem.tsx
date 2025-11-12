import { type JSX } from "solid-js";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";

export type PauseType = {
    duration: number;
} & TimelineItem;

export class PauseItem extends TimelineItem {
    _icon = "pause";

    constructor(props: PauseType) {
        super({ ...props, type: "pause" });
        this.duration = props.duration;
        this.details = {
            ...this.details,
            doesNotAdvanceTime: true,
        }
    }

    renderAsText(): string {
        return this.type.toUpperCase()
            + (this.duration ? `\n%${this.duration}` : '')
            ;
    }

}
