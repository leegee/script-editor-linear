import { type JSX } from "solid-js";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";


export type ActionType = {
    duration: number;
} & TimelineItem;

export class ActionItem extends TimelineItem {
    _icon = "electric_bolt";
    constructor(props: ActionType) {
        super({ ...props, type: "action" });
        this.duration = props.duration;
        this.details = {
            ...this.details,
        }
    }

    renderAsText(): string {
        return this.type.toUpperCase()
            + (this.duration ? `\n%${this.duration}` : '')
            ;
    }

}
