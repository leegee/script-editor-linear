import { type JSX, For } from "solid-js";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";
import { timelineItems, updateTimelineItem } from "../../stores";

export class TransitionItem extends TimelineItem {
    constructor(props: Omit<TimelineItemProps, "type">) {
        super({ ...props, type: "transition" });
    }

    get transitionType(): string | undefined {
        return this.details?.transitionType;
    }

    set transitionType(value: string | undefined) {
        if (this.details) this.details.transitionType = value;
    }

    renderCompact() {
        return <div class="timeline-item">{this.transitionType?.toUpperCase()} →</div>;
    }

    renderFull() {
        const itemId = this.id;

        const handleChange = (field: string, value: any) => {
            if (field === "duration") {
                updateTimelineItem(itemId, "duration", "", value);
            } else {
                updateTimelineItem(itemId, "details", field, value);
            }
        };

        return this.renderCreateNew({
            duration: timelineItems[itemId]?.duration,
            onChange: handleChange,
        });
    }

    renderCreateNew(props: { duration?: number; onChange: (field: string, value: any) => void }) {
        const transitionTypes = ["chop", "dissolve", "fade", "push", "slide"];
        return (
            <article>
                <header>
                    <h3>Transition</h3>
                </header>
                <div class="field border label max">
                    <select
                        value={this.transitionType ?? ""}
                        onChange={(e) => props.onChange("transitionType", e.currentTarget.value)}
                    >
                        <option value="" disabled>Select transition type</option>
                        <For each={transitionTypes}>
                            {(item) => <option value={item}>{item}</option>}
                        </For>
                    </select>
                    <label> Transition Type</label>
                </div>

                <div class="field border label max">
                    <input
                        type="number"
                        min={0}
                        value={props.duration ?? ""}
                        onInput={(e) => props.onChange("duration", Number(e.currentTarget.value))}
                    />
                    <label> Duration (seconds)</label>
                </div>
            </article>
        );
    }

    timelineContent(zoom: number): JSX.Element | string | undefined {
        return <i>transition_{this.details.transitionType ?? 'transition_fade'}</i>;
    }
}
