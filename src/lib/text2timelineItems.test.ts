import { describe, it, expect, beforeAll, afterAll, mock } from "bun:test";
import { text2timelineItemsJson } from "./text2timelineItems";

// mock stores
let characters: Record<string, any> = {};
let locations: Record<string, any> = {};

// mock lookup functions
function findCharacterByName(name: string) {
    const trimmed = name.trim().toUpperCase();
    return Object.values(characters).find(c => c.title.toUpperCase() === trimmed);
}

function findLocationByName(name: string) {
    const trimmed = name.trim().toUpperCase();
    return Object.values(locations).find(c => c.title.toUpperCase() === trimmed);
}

describe("text2timelineItems", () => {
    beforeAll(() => {
        // populate character/location stores for test
        characters = {
            Narrator: { id: "Narrator", title: "NARRATOR" },
            MotherBear: { id: "MotherBear", title: "Mother Bear" },
            BabyBear: { id: "BabyBear", title: "Baby Bear" },
        };
        locations = {
            BearsCottage: { id: "loc1", title: "The Bears’ Cottage" },
        };
    });

    it("parses a simple script into timeline items", () => {
        const text = `
ACT Act 1

SCENE Scene 1

LOCATION The Bears’ Cottage

NARRATOR
Once upon a time, there were three bears.

BABY BEAR
Hello!

How are you?

BEAT 
A bird sings in the distance.

`;

        const result = text2timelineItemsJson(
            text,
            ["ACT", "BEAT", "LOCATION", "SCENE",],
            findCharacterByName,
            findLocationByName
        );

        expect(result).toHaveLength(6);

        expect(result[0]).toMatchObject({ type: "act", title: "Act 1", details: { text: "" } });
        expect(result[1]).toMatchObject({ type: "scene", title: "Scene 1", details: { text: "" } });
        expect(result[2]).toMatchObject({ type: "location", details: { ref: "loc1", text: "" } });

        expect(result[3]).toMatchObject({
            type: "dialogue",
            details: { ref: "Narrator", text: "Once upon a time, there were three bears." }
        });

        expect(result[4]).toMatchObject({
            type: "dialogue",
            details: { ref: "BabyBear", text: "Hello!\n\nHow are you?" }
        });
    });
});
