import { type JSX } from "solid-js";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";


export type ActionType = {
    duration: number;
} & TimelineItem;

export class ActionItem extends TimelineItem {
    constructor(props: ActionType) {
        super({ ...props, type: "action" });
        this.duration = props.duration;
        this.details = {
            ...this.details,
        }
    }

    timelineContent(zoom: number): JSX.Element | string | undefined {
        return <i>electric_bolt</i>;
    }

    renderAsText(): string {
        return this.type.toUpperCase()
            + (this.duration ? `\n%${this.duration}` : '')
            ;
    }

}
