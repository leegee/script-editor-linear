import { scriptStorage, type ScriptItemProps } from "./lib/idbScriptStorage";

const sampleScript: ScriptItemProps[] = [
    { id: crypto.randomUUID(), type: "act", title: "Act 1", time: 0, text: "Act 1" },
    { id: crypto.randomUUID(), type: "scene", title: "Scene 1", time: 1, text: "Scene 1" },
    { id: crypto.randomUUID(), type: "dialogue", characterId: "Alice", text: "Hello there!", time: 2 },
    { id: crypto.randomUUID(), type: "dialogue", characterId: "Bob", text: "Hi Alice!", time: 3 }
];

export async function ingest() {
    console.log("Wiping database for debugging...");
    await scriptStorage.clear();

    console.log("Starting ingestion...");
    for (const item of sampleScript) {
        await scriptStorage.addItem(item);
        console.log(`Stored: ${item.id} (${item.type})`);
    }

    const seq = await scriptStorage.getSequence();
    console.log("Current sequence:", seq);

    console.log("Ingestion complete.");
}

