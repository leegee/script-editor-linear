import { formatHHMMSS } from "../../lib/formatSecondsToHMS";
import { sceneDurations, setTimelineItems } from "../../stores";
import InlineEditable from "../InlineEditable";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";

export class SceneItem extends TimelineItem {
    constructor(props: Omit<TimelineItemProps, "type">) {
        super({ ...props, type: 'scene' });
    }

    renderCompact() {
        return (
            <h3 class="timeline-item scene">
                <InlineEditable value={this.title ?? "Untitled Scene"} onUpdate={(v) => setTimelineItems(this.id, "title", v)} />
            </h3>
        );
    }


    renderFull() {
        return (
            <fieldset>
                <h3 class="scene field">
                    <InlineEditable value={this.title ?? "Untitled Scene"} onUpdate={(v) => setTimelineItems(this.id, "title", v)} />
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
