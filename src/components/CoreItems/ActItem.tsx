import { formatHHMMSS } from "../../lib/formatSecondsToHMS";
import { actDurations, setTimelineItems } from "../../stores";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";
import InlineEditable from "../InlineEditable";

export class ActItem extends TimelineItem {
    constructor(props: Omit<TimelineItemProps, "type">) {
        super({ ...props, type: 'act' });
    }

    renderCompact() {
        return (
            <h2 class="timeline-item act">
                <InlineEditable value={this.title ?? "Untitled Act"} onUpdate={(v) => setTimelineItems(this.id, "title", v)} />
            </h2>
        );
    }

    renderFull() {
        return (
            <fieldset>
                <h2 class="act">
                    <div class="field">
                        <InlineEditable value={this.title ?? "Untitled Act"} onUpdate={(v) => setTimelineItems(this.id, "title", v)} />
                    </div>
                </h2>
                <div class="field">
                    <p>Duration {
                        formatHHMMSS(
                            actDurations()[this.id]
                        )

                    }</p>
                </div>
            </fieldset>
        );
    }

}
