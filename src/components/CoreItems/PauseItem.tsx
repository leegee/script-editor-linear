import { type JSX } from "solid-js";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";

export type PauseType = {
    duration: number;
} & TimelineItem;

export class PauseItem extends TimelineItem {
    constructor(props: PauseType) {
        super({ ...props, type: "pause" });
        this.duration = props.duration;
        this.details = {
            ...this.details,
            doesNotAdvanceTime: true,
        }
    }

    timelineContent(zoom: number): JSX.Element | string | undefined {
        return <i>pause</i>;
    }

    renderAsText(): string {
        return this.type.toUpperCase()
            + (this.duration ? `\n%${this.duration}` : '')
            ;
    }

}
