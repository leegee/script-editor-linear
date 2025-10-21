import { createSignal, Show } from "solid-js";
import { addCharacter, characters, setCharacters, setTimelineItems } from "../../stores";
import InlineEditable from "../InlineEditable";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";
import { CharacterItem } from "./CharacterItem";

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
                    onUpdate={(v) => setTimelineItems(this.id, "details", "text", v)}
                />
            </div>
        );
    }

    renderFull() {
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
                    onUpdate={(v) => setTimelineItems(this.id, "details", "text", v)}
                />
            </div>
        );
    }

    renderCreateNew(props: { duration?: number; onChange: (field: string, value: any) => void }) {
        const [mode, setMode] = createSignal<"select" | "new">("select");

        return (
            <>
                {/* Mode toggle */}
                <div class="field border label max">
                    <select value={mode()} onChange={(e) => setMode(e.currentTarget.value as "select" | "new")}>
                        <option value="select">Select Existing</option>
                        <option value="new">Create New</option>
                    </select>
                    <label>Character Mode</label>
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

                <div class="field border label max">
                    <textarea
                        value={this.details.text ?? ""}
                        onBlur={(e) => props.onChange("text", e.currentTarget.value)}
                    />
                    <label>Dialogue Text</label>
                </div>

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
            setCharacters(id, newChar);
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

