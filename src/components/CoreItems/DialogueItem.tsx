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

type DialogueFormProps = {
    mode: "select" | "new";
    setMode: (m: "select" | "new") => void;
    values: { characterName?: string; ref?: string; text?: string; duration?: number };
    onChange: (field: "characterName" | "ref" | "text" | "duration", value: any) => void;
    // Optional advanced controls
    showAdvanced?: boolean;
    autoDuration?: boolean;
    phonemesPerSecond?: number;
    onToggleAutoDuration?: (checked: boolean) => void;
    onChangePhonemesPerSecond?: (pps: number) => void;
    helperText?: string;
};

function DialogueForm(props: DialogueFormProps) {
    return (
        <>
            <div class="field border middle-align max" title="Select or create a character">
                <label class="switch icon">
                    <input
                        type="checkbox"
                        checked={props.mode === "new"}
                        onChange={(e) => props.setMode(e.currentTarget.checked ? "new" : "select")}
                    />
                    <span><i>person_add</i></span>
                </label>
                <span class='left-padding'>
                    {props.mode === "new" ? "Create a new character" : "Select a character"}
                </span>
            </div>

            <Switch>
                <Match when={props.mode === "new"}>
                    <div class="bottom-padding max">
                        <nav class="no-space">
                            <div class="field border label max small-round left-round">
                                <input
                                    type="text"
                                    value={props.values.characterName ?? ""}
                                    onInput={(e) => props.onChange("characterName", e.currentTarget.value)}
                                />
                                <label>New character name</label>
                            </div>
                        </nav>
                    </div>
                </Match>
                <Match when={props.mode === "select"}>
                    <div class="field border label max">
                        <select
                            value={props.values.ref ?? ""}
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

            <div class="field border label max">
                <textarea
                    class="dialogueText"
                    value={props.values.text ?? ""}
                    onInput={(e) => props.onChange("text", e.currentTarget.value)}
                    rows={3}
                />
                <label>Dialogue</label>
            </div>

            <div class="field border label max">
                <input
                    type="number"
                    min={0}
                    value={props.values.duration ?? ""}
                    onInput={(e) => {
                        const v = Number(e.currentTarget.value);
                        if (Number.isFinite(v)) props.onChange("duration", v);
                    }}
                />
                <label>Duration (seconds)</label>
            </div>

            {props.showAdvanced && (
                <fieldset>
                    <div class="field border label max no-padding">
                        {props.helperText && (
                            <span class="helper tertiary-text">{props.helperText}</span>
                        )}
                    </div>

                    <hr class='space transparent' />

                    <h6>Compute duration</h6>
                    <div class="field max no-border">
                        <label class="slider">
                            <input
                                type="range"
                                value={props.phonemesPerSecond ?? 12}
                                min={8}
                                max={25}
                                disabled={!props.autoDuration}
                                onChange={(e) => props.onChangePhonemesPerSecond?.(Number(e.currentTarget.value))}
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
                                    checked={!!props.autoDuration}
                                    onChange={(e) => props.onToggleAutoDuration?.(e.currentTarget.checked)}
                                />
                                <span><i>timer</i></span>
                            </label>
                            <div class="helper small small-margin left-margin">
                                Set the speed of the dialogue using the slider
                            </div>
                        </label>
                    </div>
                </fieldset>
            )}
        </>
    );
}

export class DialogueItem extends TimelineItem {
    static createForCharacter(text: string, charId: string) {
        return new DialogueItem({
            id: crypto.randomUUID(),
            title: '',
            details: { text, ref: charId },
            notes: [],
            duration: 0,
        });
    }

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
                    class="dialogueText"
                    multiline={true}
                />
            </div>
        );
    }

    renderCreateNew(props: { duration?: number; onChange: (field: string, value: any) => void }) {
        const [mode, setMode] = createSignal<"select" | "new">("select");
        const [newCharName, setNewCharName] = createSignal("");
        const [text, setText] = createSignal("");
        const [dur, setDur] = createSignal<number | undefined>(props.duration);

        return (
            <article>
                <DialogueForm
                    mode={mode()}
                    setMode={setMode}
                    values={{ characterName: newCharName(), ref: "", text: text(), duration: dur() }}
                    onChange={(field, value) => {
                        if (field === "characterName") setNewCharName(String(value ?? ""));
                        if (field === "text") setText(String(value ?? ""));
                        if (field === "duration") {
                            const v = Number(value);
                            setDur(Number.isFinite(v) ? v : undefined);
                        }
                        props.onChange(field, value);
                    }}
                />
            </article>
        );
    }

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
                <DialogueForm
                    mode={mode()}
                    setMode={(m) => setUiState(this.id, "mode", m)}
                    values={{
                        characterName: newCharName(),
                        ref: this.details.ref,
                        text: this.details.text,
                        duration: duration(),
                    }}
                    onChange={(field, value) => {
                        if (field === "characterName") {
                            const v = String(value ?? "");
                            setNewCharName(v);
                        } else if (field === "ref") {
                            updateTimelineItem(this.id, "details", "ref", value);
                        } else if (field === "text") {
                            updateTimelineItem(this.id, "details", "text", value);
                            setDurationByPhonemes(String(value ?? ""));
                        } else if (field === "duration") {
                            const val = Number(value);
                            setUiState(this.id, "duration", val);
                            updateTimelineItem(this.id, "duration", "", val);
                        }
                    }}
                    showAdvanced={true}
                    autoDuration={autoDuration()}
                    phonemesPerSecond={phonemesPerSecond()}
                    onToggleAutoDuration={(checked) => {
                        setUiState(this.id, "autoDuration", checked);
                        setDurationByPhonemes(this.details.text);
                    }}
                    onChangePhonemesPerSecond={(newPPS) => {
                        setUiState(this.id, "phonemesPerSecond", newPPS);
                        if (autoDuration()) setDurationByPhonemes(this.details.text);
                    }}
                    helperText={(phonemesPerSecond() / 60).toFixed(2) + " minutes"}
                />
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


    async updateFromTyping(newRawText: string) {
        const lines = newRawText.split("\n");

        // New item or no speaker assigned yet?
        const isNewItem = !this.details.ref;

        if (isNewItem) {
            // --- NEW DIALOGUE ITEM LOGIC ---
            const first = lines[0].trim();

            const found = CharacterItem.findCharacterByName(first);

            if (found) {
                // First line *is* a character → good
                const updatedText = lines.slice(1).join("\n").trim();

                if (updatedText !== this.details.text) {
                    await updateTimelineItem(this.id, "details", "text", updatedText);
                }
                if (found.id !== this.details.ref) {
                    await updateTimelineItem(this.id, "details", "ref", found.id);
                }
            } else {
                // First line is NOT a character → treat whole thing as text
                const updatedText = newRawText.trim();

                if (updatedText !== this.details.text) {
                    await updateTimelineItem(this.id, "details", "text", updatedText);
                }
                // speaker remains unset
            }

            return;
        }

        // --- EXISTING DIALOGUE ITEM LOGIC ---
        const [maybeSpeaker, ...rest] = lines;
        const updatedText = rest.join("\n").trim();

        const character = CharacterItem.findCharacterByName(maybeSpeaker.trim());

        if (updatedText !== this.details.text) {
            await updateTimelineItem(this.id, "details", "text", updatedText);
        }

        if (character && character.id !== this.details.ref) {
            await updateTimelineItem(this.id, "details", "ref", character.id);
        }
    }

}

