// types.ts
export interface ScreenJSON {
    type: "screenplay";
    acts?: Act[];
    scenes?: Scene[]; // optional top-level scenes if no acts
}

export interface Act {
    id: string;
    heading: { text: string };
    scenes: Scene[];
}

export interface Scene {
    id: string;
    heading: { text: string };
    elements: Element[];
}

export type Element =
    | { id: string; type: "action"; text: string }
    | { id: string; type: "marker"; label: string }
    | { id: string; type: "dialogue"; character: string; text: string };
