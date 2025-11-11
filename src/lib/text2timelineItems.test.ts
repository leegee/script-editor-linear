// text2timelineItems.test.ts

import { describe, it, expect, beforeAll, afterAll, mock } from "bun:test";
import { text2timelineItems } from "./text2timelineItems";

describe("text2timelineItems", () => {
    // Mock crypto.randomUUID for predictable output
    const mockUUIDs = ["id1", "id2", "id3"];
    let callIndex = 0;
    const mockUUID = mock(() => mockUUIDs[callIndex++ % mockUUIDs.length]);

    beforeAll(() => {
        globalThis.crypto = { randomUUID: mockUUID } as any;
    });

    afterAll(() => {
        delete (globalThis as any).crypto;
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
`;

        const result = text2timelineItems(
            text,
            ["ACT", "SCENE", "LOCATION"]
        );

        expect(result).toHaveLength(5);

        expect(result[0]).toMatchObject({
            type: "act",
            title: "Act 1",
            details: { text: "" },
        });

        expect(result[1]).toMatchObject({
            type: "scene",
            title: "Scene 1",
            details: { text: "" },
        });

        expect(result[3]).toMatchObject({
            type: "NARRATOR",
            title: "",
            details: { text: "Once upon a time, there were three bears." },
        });

        // expect(result[4]).toMatchObject({
        //     type: "BABY BEAR",
        //     title: "",
        //     details: { text: "Hello!" },
        // });

        expect(result[2]).toMatchObject({
            type: "location",
            title: "The Bears’ Cottage",
            details: { text: "" },
        });

        // for (const item of result) {
        //     expect(typeof item.id).toBe("string");
        //     expect(item.id.length).toBeGreaterThan(0);
        // }
    });

});
