import { type JSX } from "solid-js";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";

export class PauseItem extends TimelineItem {
    constructor(props: TimelineItemProps) {
        super({ ...props, type: "lighting" });
        this.details = {
            ...this.details,
            doesNotAdvanceTime: true,
        }
    }

    timelineContent(zoom: number): JSX.Element | string | undefined {
        return <i>pause</i>;
    }

}
