import { type JSX, createSignal, Match, Show, Switch } from "solid-js";
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
        const char = characters[this.details.ref];
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
        const [newCharName, setNewCharName] = createSignal(this.details.characterName ?? "");
        const [phonemesPerSecond, setPhonemesPerSecond] = createSignal(this.details.speed || 12);
        const [duration, setDuration] = createSignal(props.duration ?? 0);
        const [mode, setMode] = createSignal<"select" | "new">(
            this.details.ref ? "select" : "new"
        );

        const setAndStorePhonemesPerSecond = (pps: number) => {
            setPhonemesPerSecond(pps);
            updateTimelineItem(this.id, 'details', 'speed', pps);
        }

        function maybeUpdateDuration(phonemeCount: number) {
            const duration = phonemeCount / phonemesPerSecond();
            setDuration(duration);
        }

        return (
            <article>
                {/* Mode toggle */}
                <div class="field border middle-align max" title="Select or create a character">
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
                <Switch>
                    <Match when={mode() === "new"}>
                        <div class="bottom-padding max">
                            <nav class="no-space">
                                <div class="field border label max small-round left-round">
                                    <input
                                        type="text"
                                        value={newCharName()}
                                        onInput={(e) => setNewCharName(e.currentTarget.value)}
                                    />
                                    <label>New character name</label>
                                </div>
                                <button class="large small-round right-round"
                                    disabled={!newCharName().trim()}
                                    onclick={() => {
                                        const id = newCharName().replace(/[^\p{L}\p{N}_]/gu, "");
                                        const newChar = new CharacterItem({ id, title: newCharName() });
                                        addCharacter(newChar);
                                        props.onChange("ref", id);
                                        setMode("select");
                                    }}
                                >
                                    <span>Create</span>
                                    <i>person</i>
                                </button>
                            </nav>
                        </div>
                    </Match>

                    {/* Select existing Character */}
                    <Match when={mode() === "select"}>
                        <div class="field border label max">
                            <select
                                value={this.details.ref ?? ""}
                                onChange={(e) => props.onChange("ref", e.currentTarget.value)}
                            >
                                <option value="" disabled>Select a character</option>
                                {Object.values(characters).map((char) => (
                                    <option value={char.id}>{char.title}</option>
                                ))}
                            </select>
                            <label>Existing Character</label>
                            <i>arrow_drop_down</i>
                        </div>
                    </Match>
                </Switch>

                {/* Dialogue Text  */}
                <TimelineItemEditor
                    id={this.id}
                    path="details"
                    key="text"
                    defaultValue={this.details.text ?? ""}
                    class="field textarea border label max"
                    multiline={true}
                    editMode={true}
                    label="Dialogue"
                    onPhonemeCount={maybeUpdateDuration}
                />

                {/* Duration input */}
                <fieldset>
                    <div class="field border label max">
                        <input
                            type="number"
                            min={0}
                            value={duration()}
                            onInput={(e) => {
                                const val = Number(e.currentTarget.value).toFixed(2);
                                setDuration(val);
                                props.onChange("duration", val);
                            }}
                        />
                        <label>Duration (seconds)</label>
                        <span class="helper tertiary-text">
                            {(phonemesPerSecond() / 60).toFixed(2)} minutes
                        </span>
                    </div>

                    <hr class='space transparent' />

                    <label class="slider">
                        <input type="range" value={phonemesPerSecond()} min={8} max={25}
                            onChange={(e) => setAndStorePhonemesPerSecond(Number(e.currentTarget.value))}
                        />
                        <span></span>
                        <div class="tooltip bottom"></div>
                    </label>
                </fieldset>
            </article>
        );
    }

    prepareFromFields(fields: Record<string, any>) {
        let ref = fields.ref;

        // Create a new Character
        if (!ref && fields.characterName) {
            const id = fields.characterName.replace(/[^\p{L}\p{N}_]/gu, "");
            const newChar = new CharacterItem({
                id,
                title: fields.characterName,
            });
            addCharacter(newChar);
            ref = id;
        }

        return {
            type: "dialogue",
            title: fields.title ?? "Dialogue",
            duration: fields.duration,
            details: {
                text: fields.text ?? "...",
                ref,
            },
        };
    }

    timelineContent(zoom: number): JSX.Element | string | undefined {
        return <i>3p</i>;
    }

}

