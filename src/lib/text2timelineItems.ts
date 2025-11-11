import { CharacterItem } from "../components/CoreItems/CharacterItem";
import { CanonicalLocationType } from "../components/CoreItems/Locations/CanonicalLocation";

const RE_FIRST_WORD_CAPS = /^[A-Z0-9 _'-]+$/;

export function text2timelineItemsJson(
    text: string,
    timelineItemTypesForTyping: string[],
    findCharacterByName: (name: string) => CharacterItem | undefined,
    findLocationByName: (name: string) => CanonicalLocationType | undefined,
) {
    const lines = text.split(/\r?\n/);
    const items: any[] = [];

    let currentItem: any = null;

    const commit = () => {
        if (currentItem) {
            items.push(currentItem);
        }
        currentItem = null;
    };

    for (let line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const firstWord = trimmed.split(/\s+/)[0].toUpperCase();
        const rest = trimmed.slice(firstWord.length).trim();

        // Known header types (act, scene, beat, location, etc.)
        if (timelineItemTypesForTyping.includes(firstWord as Uppercase<string>)) {
            commit();
            const type = firstWord.toLowerCase();

            if (type === "location") {
                const ref = findLocationByName(rest);
                if (!ref) throw new Error(`Could not find location referenced by "${rest}"`);
                currentItem = { type, notes: [], tags: [], details: { ref: ref.id, text: "" } };
            } else {
                currentItem = { type, notes: [], tags: [], title: rest || "", details: { text: "" } };
            }
        }
        // All-caps line not known header: dialogue character
        else if (RE_FIRST_WORD_CAPS.test(trimmed)) {
            const ref = findCharacterByName(trimmed);
            if (!ref) throw new Error(`Could not find dialogue referenced by "${trimmed}"`);
            commit();
            currentItem = { type: "dialogue", notes: [], tags: [], details: { ref: ref.id, text: "" } };
        }
        // Notes
        else if (currentItem && trimmed.startsWith("@")) {
            currentItem.notes.push(trimmed.slice(1).trim());
        }
        // Tags
        else if (currentItem && trimmed.startsWith("#")) {
            currentItem.tags.push(trimmed.slice(1).trim());
        }
        // Duration
        else if (currentItem.type === "dialogue" && currentItem && trimmed.startsWith("%")) {
            const value = trimmed.slice(1).trim();
            if (/^\d+$/.test(value)) {
                currentItem.duration = Number(value);
            } else {
                console.warn("Duration must be numeric:", value);
            }
        }
        // Regular text
        else if (currentItem) {
            currentItem.details.text += (currentItem.details.text ? "\n\n" : "") + trimmed;
        }
        else {
            console.warn("Ignoring line without current item:", trimmed);
        }
    }

    commit();
    return items;
}
