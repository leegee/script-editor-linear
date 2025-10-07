import { scriptStorage } from "./stores/idbScriptStore";
import { AllClassPropsUnion } from './classes/index';

const sampleScript: AllClassPropsUnion[] = [
    { id: crypto.randomUUID(), type: "act", text: "Act 1" },
    { id: crypto.randomUUID(), type: "scene", text: "Scene 1" },
    { id: crypto.randomUUID(), type: "location", text: "The Bears’ Cottage", lat: 51.5074, lng: -0.1278, radius: 150 },

    { id: crypto.randomUUID(), type: "dialogue", characterId: "Narrator", text: "Once upon a time, there were three bears who lived together in a little house in the woods." },
    { id: crypto.randomUUID(), type: "dialogue", characterId: "Narrator", text: "There was a great big father bear, a middle-sized mother bear, and a tiny little baby bear." },

    { id: crypto.randomUUID(), type: "dialogue", characterId: "FatherBear", text: "Breakfast time! My porridge is far too hot to eat just yet." },
    { id: crypto.randomUUID(), type: "dialogue", characterId: "MotherBear", text: "Mine too, dear. Let’s take a little walk in the forest while it cools down." },
    { id: crypto.randomUUID(), type: "dialogue", characterId: "BabyBear", text: "Yes, let’s go! I love walks!" },

    { id: crypto.randomUUID(), type: "scene", text: "Scene 2" },
    { id: crypto.randomUUID(), type: "location", text: "Forest Path", lat: 51.5076, lng: -0.1281, radius: 200 },

    { id: crypto.randomUUID(), type: "dialogue", characterId: "Narrator", text: "So the three bears set off for their walk in the woods." },
    { id: crypto.randomUUID(), type: "dialogue", characterId: "Narrator", text: "While they were away, a little girl named Goldilocks came wandering along the same path." },
    { id: crypto.randomUUID(), type: "dialogue", characterId: "Goldilocks", text: "What a lovely little house! I wonder who lives here..." },

    { id: crypto.randomUUID(), type: "scene", text: "Scene 3" },
    { id: crypto.randomUUID(), type: "location", text: "Inside the Bears’ Cottage", lat: 51.5075, lng: -0.1279, radius: 120 },
    { id: crypto.randomUUID(), type: "dialogue", characterId: "Narrator", text: "Goldilocks knocked at the door, but no one answered. So she pushed it open and went inside." },
    { id: crypto.randomUUID(), type: "dialogue", characterId: "Goldilocks", text: "Mmm! What a delicious smell! Porridge!" },
    { id: crypto.randomUUID(), type: "dialogue", characterId: "Narrator", text: "On the table were three bowls of porridge. Goldilocks tasted the porridge from the first bowl." },
    { id: crypto.randomUUID(), type: "dialogue", characterId: "Goldilocks", text: "Ouch! This porridge is too hot!" },
    { id: crypto.randomUUID(), type: "dialogue", characterId: "Narrator", text: "She tasted the porridge from the second bowl." },
    { id: crypto.randomUUID(), type: "dialogue", characterId: "Goldilocks", text: "This one’s too cold." },
    { id: crypto.randomUUID(), type: "dialogue", characterId: "Narrator", text: "Finally, she tasted the porridge from the third bowl." },
    { id: crypto.randomUUID(), type: "dialogue", characterId: "Goldilocks", text: "Ahh! This porridge is just right." },
    { id: crypto.randomUUID(), type: "dialogue", characterId: "Narrator", text: "And she ate it all up." }
];

export async function ingest() {
    console.dir('ingest');
    console.log("Wiping database for debugging...");
    await scriptStorage.clear();

    console.log("Starting ingestion...");
    for (const item of sampleScript) {
        await scriptStorage.addItem(item);
        console.log(`Stored: ${item.id} (${item.type})`);
    }

    const seq = await scriptStorage.getSequence();
    await scriptStorage.reorderItems(seq);

    console.log("Current sequence:", seq);
    console.log("Ingestion complete.");
    console.dir('ingest');
}

