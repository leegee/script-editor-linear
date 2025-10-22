import { formatHHMMSS } from "../../lib/formatSecondsToHMS";
import { sceneDurations, updateTimelineItem } from "../../stores";
import InlineEditable from "../InlineEditable";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";

export class SceneItem extends TimelineItem {
    constructor(props: Omit<TimelineItemProps, "type">) {
        super({ ...props, type: 'scene' });
    }

    renderCompact() {
        return (
            <h3 class="timeline-item">
                <InlineEditable value={this.title ?? "Untitled Scene"} onUpdate={(v) => updateTimelineItem(this, "title", "", v)} />
            </h3>
        );
    }


    renderFull() {
        return (
            <fieldset>
                <h3 class="field">
                    <InlineEditable value={this.title ?? "Untitled Scene"} onUpdate={(v) => updateTimelineItem(this, "title", "", v)} />
                </h3>
                <div class="field">
                    <p>Duration {
                        formatHHMMSS(
                            sceneDurations()[this.id]
                        )

                    }</p>
                </div>
            </fieldset>
        );
    }
}
