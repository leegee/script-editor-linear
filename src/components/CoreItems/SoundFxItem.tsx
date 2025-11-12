import { type JSX } from 'solid-js';

import { TimelineItem, TimelineItemProps } from "./TimelineItem";

export class SoundFxItem extends TimelineItem {
    _icon = "brand_awareness";

    constructor(props: TimelineItemProps) {
        super({ ...props, type: "soundfx" });
        this.details = {
            ...this.details,
            doesNotAdvanceTime: true,
        }
    }
}
