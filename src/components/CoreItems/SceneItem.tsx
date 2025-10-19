import { formatHHMMSS } from "../../lib/formatSecondsToHMS";
import { sceneDurations, setTimelineItems } from "../../stores";
import InlineEditable from "../InlineEditable";
import { TimelineItem } from "./TimelineItem";

export class SceneItem extends TimelineItem {
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
                <h2 class="act">
                    <div class="field">
                        <InlineEditable value={this.title ?? "Untitled Scene"} onUpdate={(v) => setTimelineItems(this.id, "title", v)} />
                    </div>
                </h2>
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
