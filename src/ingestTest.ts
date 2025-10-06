// ingestTest.ts
import { idbStorage } from "./lib/idbStorage";

export interface ScriptItemJSON {
    id: string;
    type: string;
    text: string;
    time: number;
    [key: string]: any;
}

// --- Sample data ---
const sampleScript: ScriptItemJSON[] = [
    { id: crypto.randomUUID(), type: "act", title: "Act 1", time: 0, text: "Act 1" },
    { id: crypto.randomUUID(), type: "scene", title: "Scene 1", time: 1, text: "Scene 1" },
    { id: crypto.randomUUID(), type: "dialogue", speaker: "Alice", text: "Hello there!", time: 2 },
    { id: crypto.randomUUID(), type: "dialogue", speaker: "Bob", text: "Hi Alice!", time: 3 }
];

export async function ingest() {
    console.log("Starting ingestion...");

    for (const item of sampleScript) {
        await idbStorage.setItem(item.id, JSON.stringify(item));
        console.log(`Stored: ${item.id} (${item.type})`);
    }

    console.log("Ingestion complete.");
}

// Optionally run automatically
ingest().catch(console.error);
