import { type JSX } from 'solid-js';
import { formatHHMMSS } from "../../lib/formatSecondsToHMS";
import { actDurations } from "../../stores";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";
import TimelineItemEditor from "../ItemEditor";

export class ActItem extends TimelineItem {
    constructor(props: Omit<TimelineItemProps, "type">) {
        super({ ...props, type: 'act' });
    }

    renderCompact() {
        return (
            <h2 class="timeline-item">
                <TimelineItemEditor
                    id={this.id}
                    path="title"
                    defaultValue={this.title ?? "Untitled Act"}
                />
            </h2>
        );
    }

    renderFull() {
        return (
            <fieldset>
                <h2 class="field">
                    <TimelineItemEditor
                        id={this.id}
                        path="title"
                        defaultValue={this.title ?? "Untitled Act"}
                    />
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
