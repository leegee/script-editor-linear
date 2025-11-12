import { describe, it, expect, beforeAll } from "bun:test";
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

describe("text2timelineItemsJson with tags and notes", () => {
    beforeAll(() => {
        characters = {
            Narrator: { id: "Narrator", title: "NARRATOR" },
            BabyBear: { id: "BabyBear", title: "Baby Bear" },
        };
        locations = {
            BearsCottage: { id: "loc1", title: "The Bears’ Cottage" },
        };
    });

    it("parses headers, dialogue, location, and extracts tags/notes", () => {
        const text = `
ACT Act 1

SCENE Scene 1

LOCATION The Bears’ Cottage

NARRATOR
Once upon a time, there were three bears.
#tag1
@note1

BABY BEAR
#tag2 
@note2
Hello!
How are you?

BEAT
A bird sings in the distance. 
#tag3

MUSIC
%5
A tune

ACTION Testing
%5 #tag1 #tag2 @note1 @note2
Testing multiline tag/note/time

`;

        const result = text2timelineItemsJson(
            text,
            ["ACT", "ACTION", "BEAT", "LOCATION", "SCENE", "MUSIC"],
            findCharacterByName,
            findLocationByName
        );

        expect(result).toHaveLength(8);

        expect(result[0]).toMatchObject({ type: "act", title: "Act 1", details: { text: "" } });

        expect(result[1]).toMatchObject({ type: "scene", title: "Scene 1", details: { text: "" } });

        expect(result[2]).toMatchObject({ type: "location", details: { ref: "loc1", text: "" } });

        expect(result[3]).toMatchObject({
            type: "dialogue",
            tags: ["tag1"],
            notes: ["note1"],
            details: {
                ref: "Narrator",
                text: "Once upon a time, there were three bears.",
            }
        });

        expect(result[4]).toMatchObject({
            type: "dialogue",
            tags: ["tag2"],
            notes: ["note2"],
            details: {
                ref: "BabyBear",
                text: "Hello!\n\nHow are you?",
            }
        });

        expect(result[5]).toMatchObject({
            type: "beat",
            title: "",
            tags: ["tag3"],
            notes: [],
            details: {
                text: "A bird sings in the distance.",
            }
        });

        expect(result[6]).toMatchObject({
            type: "music",
            title: "",
            tags: [],
            notes: [],
            duration: 5,
            details: {
                text: "A tune",
            }
        });

        expect(result[7]).toMatchObject({
            type: "action",
            title: "Testing",
            tags: ['tag1', 'tag2'],
            notes: ['note1', 'note2'],
            duration: 5,
            details: {
                text: "Testing multiline tag/note/time",
            }
        });
    });
});
