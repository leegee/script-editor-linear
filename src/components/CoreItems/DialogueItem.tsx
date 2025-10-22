import { createSignal, Show } from "solid-js";
import { addCharacter, characters, updateTimelineItem } from "../../stores";
import InlineEditable from "../InlineEditable";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";
import { CharacterItem } from "./CharacterItem";
import AutoResizingTextarea from "../AutoRessizingTextarea";

export class DialogueItem extends TimelineItem {
    constructor(props: Omit<TimelineItemProps, "type">) {
        super({ ...props, type: 'dialogue' });
    }

    renderCompact() {
        const char = characters[this.details.characterId];
        const speakerName = char?.title ?? "Unknown Speaker";

        return (
            <div class="timeline-item">
                <span class="character-name">
                    {speakerName}
                </span>
                <InlineEditable
                    class="dialogueText"
                    value={this.details.text}
                    onUpdate={(v) => updateTimelineItem(this, "details", "text", v)}
                />
            </div>
        );
    }

    renderFull() {
        const existing = this;
        const details = existing.details;

        const handleChange = (field: string, value: any) => {
            updateTimelineItem(existing, "details", field, value);
        };

        return this.renderCreateNew({
            duration: existing.duration,
            onChange: handleChange
        });
    }

    renderCreateNew(props: { duration?: number; onChange: (field: string, value: any) => void }) {
        const [mode, setMode] = createSignal<"select" | "new">("select");

        return (
            <>
                {/* Mode toggle */}
                <div class="field border middle-align max">
                    <label class="switch icon">
                        <input
                            type="checkbox"
                            checked={mode() === "new"}
                            onChange={(e) => setMode(e.currentTarget.checked ? "new" : "select")}
                        />
                        <span>
                            <i>person_add</i>
                        </span>
                    </label>
                    <span class='left-padding'>{mode() === "new" ? "Create a new character" : "Select a character"}</span>
                </div>

                {/* New Character creation */}
                <Show when={mode() === "new"}>
                    <div class="field border label max">
                        <input
                            type="text"
                            value={this.details.characterName ?? ""}
                            onInput={(e) => props.onChange("characterName", e.currentTarget.value)}
                        />
                        <label>Character Name</label>
                    </div>
                </Show>

                {/* Select existing Character */}
                <Show when={mode() === "select"}>
                    <div class="field border label max">
                        <select
                            value={this.details.characterId ?? ""}
                            onChange={(e) => props.onChange("characterId", e.currentTarget.value)}
                        >
                            <option value="" disabled>Select a character</option>
                            {Object.values(characters).map((char) => (
                                <option value={char.id}>{char.title}</option>
                            ))}
                        </select>
                        <label>Existing Character</label>
                    </div>
                </Show>

                <AutoResizingTextarea
                    label="Dialogue Text"
                    class="field textarea border label max"
                    value={this.details.text ?? ""}
                    maxHeight={200}
                    onInput={(v) => props.onChange("text", v)}
                />

                <div class="field border label max">
                    <input
                        type="number"
                        min={0}
                        value={props.duration ?? ""}
                        onInput={(e) => props.onChange("duration", Number(e.currentTarget.value))}
                    />
                    <label>Duration (seconds)</label>
                </div>
            </>
        );
    }

    prepareFromFields(fields: Record<string, any>) {
        let characterId = fields.characterId;

        // Create a new Character if user entered one in "new" mode
        if (!characterId && fields.characterName) {
            const id = fields.characterName.replace(/[^\p{L}\p{N}_]/gu, "");
            const newChar = new CharacterItem({
                id,
                title: fields.characterName,
            });
            addCharacter(newChar);
            characterId = id;
        }

        return {
            type: "dialogue",
            title: fields.title ?? "Dialogue",
            duration: fields.duration,
            details: {
                text: fields.text ?? "...",
                characterId,
            },
        };
    }
}

