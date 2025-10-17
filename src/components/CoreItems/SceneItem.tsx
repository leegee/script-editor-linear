import { setTimelineItems } from "../../stores";
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
}
