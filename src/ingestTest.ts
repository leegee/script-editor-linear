import { scriptStorage } from "./stores/idbScriptStore";
import { AllClassPropsUnion } from './classes/index';

const sampleScript: AllClassPropsUnion[] = [
    { id: crypto.randomUUID(), type: "act", text: "Act 1" },
    { id: crypto.randomUUID(), type: "scene", text: "Scene 1" },
    { id: crypto.randomUUID(), type: "location", text: "Crystal Cav", lat: 47.49801, lng: 19.03991, radius: 100 },
    { id: crypto.randomUUID(), type: "dialogue", characterId: "Alice", text: "Hello there!" },
    { id: crypto.randomUUID(), type: "dialogue", characterId: "Bob", text: "Hi Alice!" }
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

    // await scriptStorage.reorderItems(seq);

    console.log("Ingestion complete.");
}

