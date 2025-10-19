import { characters, setTimelineItems } from "../../stores";
import InlineEditable from "../InlineEditable";
import { TimelineItem } from "./TimelineItem";

export class DialogueItem extends TimelineItem {
    renderCompact() {
        const char = characters[this.details.characterId];
        const speakerName = char?.name ?? "Unknown Speaker";

        return (
            <div class="timeline-item">
                {speakerName}
                <InlineEditable
                    class="dialogueText"
                    value={this.details.text}
                    onUpdate={(v) => setTimelineItems(this.id, "details", "text", v)}
                />
            </div>
        );
    }

    renderCreateNew(props: { duration?: number; onChange: (field: string, value: any) => void }) {
        return (
            <>
                <div class="field border label max">
                    <input
                        type="text"
                        value={this.details.text ?? ""}
                        onInput={(e) => props.onChange("text", e.currentTarget.value)}
                    />
                    <label> Dialogue Text</label>
                </div>

                <div class="field border label max">
                    <select
                        value={this.details.characterId ?? ""}
                        onChange={(e) => props.onChange("characterId", e.currentTarget.value)}
                    >
                        <option value="" disabled>Select a character</option>
                        {Object.values(characters).map((char) => (
                            <option value={char.id}>{char.name}</option>
                        ))}
                    </select>
                    <label> Character</label>
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

