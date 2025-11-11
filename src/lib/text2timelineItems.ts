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

        // If the first word is a known header:
        if (timelineItemTypesForTyping.includes(firstWord as Uppercase<string>)) {
            commit();
            const type = firstWord.toLowerCase();

            if (type === "location") {
                const ref = findLocationByName(rest);
                if (!ref) throw new Error(`Could not find location referenced by "${rest}"`);
                currentItem = { type, details: { ref: ref.id, text: "" } };
            } else {
                currentItem = { type, title: rest || "", details: { text: "" } };
            }
        }

        // All-caps line: dialogue header
        else if (RE_FIRST_WORD_CAPS.test(trimmed)) {
            const ref = findCharacterByName(trimmed);
            if (!ref) throw new Error(`Could not find dialogue referenced by "${trimmed}"`);
            commit();
            currentItem = { type: "dialogue", details: { ref: ref.id, text: "" } };
        }

        // All else: append to current item's text
        else if (currentItem) {
            currentItem.details.text += (currentItem.details.text ? "\n\n" : "") + line;
        } else {
            console.warn("Ignoring line without current item:", line);
        }
    }

    commit();
    return items;
}
