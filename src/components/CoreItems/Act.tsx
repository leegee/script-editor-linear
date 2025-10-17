import { setTimelineItems } from "../../stores";
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
}
