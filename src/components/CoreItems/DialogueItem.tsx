import { type JSX, createSignal, Match, type Signal, Switch } from "solid-js";
import { addCharacter, characters, updateTimelineItem } from "../../stores";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";
import { CharacterItem } from "./CharacterItem";
import TimelineItemEditor from "../TimelineItemEditor";
import { countPhonemes } from "../../lib/countPhonems";
import { createStore } from "solid-js/store";

type DialogueUiState = {
    autoDuration: boolean;
    phonemesPerSecond: number;
    duration: number;
    mode: "select" | "new";
};

const [uiState, setUiState] = createStore<Record<string, DialogueUiState>>({});

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

    // renderCreateNew(props: { duration?: number; onChange: (field: string, value: any) => void }) {
    //     return super.renderCreateNew({
    //         ...props,
    //     })
    // }

    renderFull() {
        // Local signal for the new character name input
        const [newCharName, setNewCharName] = createSignal(this.details.characterName ?? "");

        // Initialize per-item UI state if missing
        if (!uiState[this.id]) {
            setUiState(this.id, {
                autoDuration: false,
                phonemesPerSecond: this.details.speed ?? 12,
                mode: this.details.ref ? "select" : "new",
                duration: this.duration ?? 0, // reactive duration
            });
        }

        // Reactive accessors
        const getUI = () => uiState[this.id]!;
        const autoDuration = () => getUI().autoDuration;
        const phonemesPerSecond = () => getUI().phonemesPerSecond;
        const mode = () => getUI().mode;
        const duration = () => getUI().duration;

        // Compute duration from phonemes
        const setDurationByPhonemes = (text: string) => {
            if (autoDuration()) {
                const phonemeCount = countPhonemes(text);
                const dur = Number((phonemeCount / phonemesPerSecond()).toFixed(2));
                setUiState(this.id, "duration", dur); // reactive update
                updateTimelineItem(this.id, "duration", "", dur);
            }
        };

        return (
            <article>
                {/* Mode toggle */}
                <div class="field border middle-align max" title="Select or create a character">
                    <label class="switch icon">
                        <input
                            type="checkbox"
                            checked={mode() === "new"}
                            onChange={(e) =>
                                setUiState(this.id, "mode", e.currentTarget.checked ? "new" : "select")
                            }
                        />
                        <span><i>person_add</i></span>
                    </label>
                    <span class='left-padding'>
                        {mode() === "new" ? "Create a new character" : "Select a character"}
                    </span>
                </div>

                {/* Character creation / selection */}
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
                                <button
                                    class="large small-round right-round"
                                    disabled={!newCharName().trim()}
                                    onclick={() => {
                                        const newCharId = newCharName().replace(/[^\p{L}\p{N}_]/gu, "");
                                        const newChar = new CharacterItem({ id: newCharId, title: newCharName() });
                                        addCharacter(newChar);
                                        updateTimelineItem(this.id, "details", "ref", newCharId);
                                        setUiState(this.id, "mode", "select");
                                    }}
                                >
                                    <span>Create</span>
                                    <i>person</i>
                                </button>
                            </nav>
                        </div>
                    </Match>
                    <Match when={mode() === "select"}>
                        <div class="field border label max">
                            <select
                                value={this.details.ref ?? ""}
                                onChange={(e) => updateTimelineItem(this.id, "details", "ref", e.currentTarget.value)}
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

                {/* Dialogue Text Editor */}
                <TimelineItemEditor
                    id={this.id}
                    path="details"
                    key="text"
                    defaultValue={this.details.text ?? ""}
                    class="field textarea border label max"
                    multiline={true}
                    editMode={true}
                    label="Dialogue"
                    onChange={setDurationByPhonemes}
                />

                {/* Duration input */}
                <fieldset>
                    <div class="field border label max no-padding">
                        <input
                            type="number"
                            min={0}
                            value={duration()} // reactive value
                            onBlur={(e) => {
                                const val = Number(e.currentTarget.value);
                                setUiState(this.id, "duration", val);
                                updateTimelineItem(this.id, "duration", "", val);
                            }}
                        />
                        <label>Duration (seconds)</label>
                        <span class="helper tertiary-text">
                            {(phonemesPerSecond() / 60).toFixed(2)} minutes
                        </span>
                    </div>

                    <hr class='space transparent' />

                    <h6>Compute duration</h6>
                    <div class="field max no-border">
                        <label class="slider">
                            <input
                                type="range"
                                value={phonemesPerSecond()}
                                min={8}
                                max={25}
                                disabled={!autoDuration()}
                                onChange={(e) => {
                                    const newPPS = Number(e.currentTarget.value);
                                    setUiState(this.id, "phonemesPerSecond", newPPS);
                                    // Recompute duration immediately if autoDuration is on
                                    if (autoDuration()) {
                                        setDurationByPhonemes(this.details.text);
                                    }
                                }}
                            />
                            <span></span>
                            <div class="tooltip bottom">phonemes per second</div>
                        </label>
                    </div>

                    <div class="field max">
                        <label class="slider tiny">
                            <label class="switch icon">
                                <input
                                    type="checkbox"
                                    checked={autoDuration()}
                                    onChange={(e) => {
                                        setUiState(this.id, "autoDuration", e.currentTarget.checked);
                                        setDurationByPhonemes(this.details.text);
                                    }}
                                />
                                <span><i>timer</i></span>
                            </label>
                            <div class="helper small small-margin left-margin">
                                Set the speed of the dialogue using the slider
                            </div>
                        </label>
                    </div>
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

