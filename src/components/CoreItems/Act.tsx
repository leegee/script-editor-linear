import { formatHHMMSS } from "../../lib/formatSecondsToHMS";
import { actDurations, setTimelineItems } from "../../stores";
import InlineEditable from "../InlineEditable";
import { TimelineItem } from "./TimelineItem";

export class ActItem extends TimelineItem {
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
