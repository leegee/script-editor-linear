import { formatHHMMSS } from "../../lib/formatSecondsToHMS";
import { sceneDurations } from "../../stores";
import TimelineItemEditor from "../TimelineItemEditor";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";

export class SceneItem extends TimelineItem {
    constructor(props: Omit<TimelineItemProps, "type">) {
        super({ ...props, type: 'scene' });
    }

    renderCompact() {
        return (
            <h3 class="timeline-item">
                <TimelineItemEditor
                    id={this.id}
                    path="title"
                    defaultValue={this.title ?? "Untitled Scene"}
                />
            </h3>
        );
    }


    renderFull() {
        return (
            <fieldset>
                <h3 class="field">
                    <TimelineItemEditor
                        id={this.id}
                        path="title"
                        defaultValue={this.title ?? "Untitled Scene"}
                    />
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
