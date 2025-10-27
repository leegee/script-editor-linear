import { dictionary } from "cmu-pronouncing-dictionary";

export function countPhonemes(text: string): number {
    const words = text
        .trim()
        .toUpperCase()
        .replace(/[^A-Z\s']/g, "") // remove non-letter characters except apostrophes
        .split(/\s+/)
        .filter(Boolean);

    let total = 0;
    const vowels = "AEIOU";

    for (const word of words) {
        const pronunciations = dictionary[word];
        if (pronunciations && pronunciations.length > 0) {
            // Use first pronunciation
            total += pronunciations[0].split(" ").length;
        } else {
            // Fallback: count vowels in the word
            const vowelCount = [...word].filter(c => vowels.includes(c)).length;
            total += Math.max(1, vowelCount); // at least 1 phoneme
        }
    }

    return total;
}

