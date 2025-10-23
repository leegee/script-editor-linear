import { createSignal, Show } from "solid-js";
import { addCharacter, characters, timelineItems, updateTimelineItem } from "../../stores";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";
import { CharacterItem } from "./CharacterItem";
import TimelineItemEditor from "../ItemEditor";

export class DialogueItem extends TimelineItem {
    constructor(props: Omit<TimelineItemProps, "type">) {
        super({ ...props, type: 'dialogue' });
    }

    openEditor() {
        alert(this.id)
    }

    renderCompact() {
        const char = characters[this.details.characterId];
        const speakerName = char?.title ?? "Unknown Speaker";

        return (
            <div class="timeline-item">
                <span class="character-name">
                    {speakerName}
                </span>
                <TimelineItemEditor
                    id={this.id}
                    path="details"
                    key="text"
                    defaultValue={this.details.text ?? "..."}
                    class="dialogueText"
                    multiline={true}
                />
            </div>
        );
    }

    renderFull() {
        const itemId = this.id;

        const handleChange = (field: string, value: any) => {
            updateTimelineItem(itemId, "details", field, value);
        };

        return this.renderCreateNew({
            duration: timelineItems[itemId].duration,
            onChange: handleChange
        });
    }

    renderCreateNew(props: { duration?: number; onChange: (field: string, value: any) => void }) {
        // Determine initial mode based on whether a character is already selected
        const [mode, setMode] = createSignal<"select" | "new">(
            this.details.characterId ? "select" : "new"
        );

        const [newCharName, setNewCharName] = createSignal(this.details.characterName ?? "");
        const [duration, setDuration] = createSignal(props.duration ?? 0);

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
                    <span class='left-padding'>
                        {mode() === "new" ? "Create a new character" : "Select a character"}
                    </span>
                </div>

                {/* New Character creation */}
                <Show when={mode() === "new"}>
                    <div class="field border label max">
                        <input
                            type="text"
                            value={newCharName()}
                            onInput={(e) => setNewCharName(e.currentTarget.value)}
                        />
                        <label>New character name</label>
                        <i>person</i>
                        <button
                            disabled={!newCharName().trim()}
                            onclick={() => {
                                const id = newCharName().replace(/[^\p{L}\p{N}_]/gu, "");
                                const newChar = new CharacterItem({ id, title: newCharName() });
                                addCharacter(newChar);
                                props.onChange("characterId", id);
                                setMode("select");
                            }}
                        >
                            Create Character
                        </button>
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
                        <i>arrow_drop_down</i>
                    </div>
                </Show>

                {/* Dialogue Text using TimelineItemEditor */}
                <TimelineItemEditor
                    id={this.id}
                    path="details"
                    key="text"
                    defaultValue={this.details.text ?? ""}
                    class="field textarea border label max"
                    multiline={true}
                    editMode={true}
                    label="Dialogue"
                />

                {/* Duration input */}
                <div class="field border label max">
                    <input
                        type="number"
                        min={0}
                        value={duration()}
                        onInput={(e) => {
                            const val = Number(e.currentTarget.value);
                            setDuration(val);
                            props.onChange("duration", val);
                        }}
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

