import { For } from "solid-js";
import { TimelineItem } from "./TimelineItem";

export class TransitionItem extends TimelineItem {
    transitionType?: "fade" | "cut" | "dissolve";
    renderCompact() {
        return <div class="timeline-item">{this.transitionType?.toUpperCase()} →</div>;
    }
    renderFull() {
        return <div class="timeline-item">{this.transitionType?.toUpperCase()} →</div>;
    }
    renderCreateNew(props: { duration?: number; onChange: (field: string, value: any) => void }) {
        const transitionTypes = ['chop', 'dissolve', 'fade', 'push', 'slide',];
        return (
            <>
                <div class="field border label max">
                    <select
                        value={this.transitionType ?? ""}
                        onChange={(e) => props.onChange("transitionType", e.currentTarget.value)}
                    >
                        <option value="" disabled>Select transition type</option>
                        <For each={transitionTypes}>
                            {(item) => (
                                <option value={item}>{item}</option>
                            )}
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
            </>
        );
    }
}
