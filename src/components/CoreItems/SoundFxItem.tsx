import { type JSX } from 'solid-js';

import { TimelineItem, TimelineItemProps } from "./TimelineItem";

export class SoundFxItem extends TimelineItem {
    constructor(props: TimelineItemProps) {
        super({ ...props, type: "soundfx" });
        this.details = {
            ...this.details,
            doesNotAdvanceTime: true,
        }
    }

    timelineContent(zoom: number): JSX.Element | string | undefined {
        return <i>brand_awareness</i>;
    }
}
