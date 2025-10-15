import { type ScriptItemProps, ScriptItem } from "../classes/CoreItems";
import { storage } from "../db";
import { addScriptItem, setScriptItems, setSequence } from "../stores/coreStores";

export const sampleScript: ScriptItemProps[] = [
    // Act 1
    { id: crypto.randomUUID(), type: "act", title: "Act 1", startTime: 0, duration: 0 },

    // Scene 1
    { id: crypto.randomUUID(), type: "scene", title: "Scene 1", startTime: 0, duration: 20 },
    { id: crypto.randomUUID(), type: "location", title: "The Bears’ Cottage", details: { lat: 51.5074, lng: -0.1278, radius: 150 }, startTime: 0, duration: 0 },

    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Narrator", text: "Once upon a time, there were three bears who lived together in a little house in the woods." }, startTime: 1, duration: 5 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Narrator", text: "There was a great big father bear, a middle-sized mother bear, and a tiny little baby bear." }, startTime: 6, duration: 4 },

    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "FatherBear", text: "Breakfast time! My porridge is far too hot to eat just yet." }, startTime: 10, duration: 3 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "MotherBear", text: "Mine too, dear. Let’s take a little walk in the forest while it cools down." }, startTime: 13, duration: 4 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "BabyBear", text: "Yes, let’s go! I love walks!" }, startTime: 17, duration: 2 },

    // Scene 2
    { id: crypto.randomUUID(), type: "scene", title: "Scene 2", startTime: 20, duration: 25 },
    { id: crypto.randomUUID(), type: "location", title: "Forest Path", details: { lat: 51.5076, lng: -0.1281, radius: 200 }, startTime: 20, duration: 0 },

    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Narrator", text: "So the three bears set off for their walk in the woods." }, startTime: 21, duration: 5 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Narrator", text: "While they were away, a little girl named Goldilocks came wandering along the same path." }, startTime: 26, duration: 6 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Goldilocks", text: "What a lovely little house! I wonder who lives here..." }, startTime: 32, duration: 3 },

    // Scene 3
    { id: crypto.randomUUID(), type: "scene", title: "Scene 3", startTime: 36, duration: 40 },
    { id: crypto.randomUUID(), type: "location", title: "Inside the Bears’ Cottage", details: { lat: 51.5075, lng: -0.1279, radius: 120 }, startTime: 36, duration: 0 },

    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Narrator", text: "Goldilocks knocked at the door, but no one answered. So she pushed it open and went inside." }, startTime: 37, duration: 5 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Goldilocks", text: "Mmm! What a delicious smell! Porridge!" }, startTime: 42, duration: 3 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Narrator", text: "On the table were three bowls of porridge. Goldilocks tasted the porridge from the first bowl." }, startTime: 45, duration: 4 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Goldilocks", text: "Ouch! This porridge is too hot!" }, startTime: 49, duration: 2 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Narrator", text: "She tasted the porridge from the second bowl." }, startTime: 51, duration: 2 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Goldilocks", text: "This one’s too cold." }, startTime: 53, duration: 2 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Narrator", text: "Finally, she tasted the porridge from the third bowl." }, startTime: 55, duration: 2 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Goldilocks", text: "Ahh! This porridge is just right." }, startTime: 57, duration: 2 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Narrator", text: "And she ate it all up." }, startTime: 59, duration: 2 }
];


export async function ingest() {
    console.log("Starting ingestion of Three Bears...");

    await storage.clearTable("scriptItems");
    setScriptItems({});
    setSequence([]);

    const seq: string[] = [];
    for (const props of sampleScript) {
        const item = new ScriptItem(props);
        await storage.put("scriptItems", item);
        setScriptItems(item.id, item);
        seq.push(item.id);
        console.log(item.id, item.type, item.title)
    }

    setSequence(seq);
    await storage.putMeta("sequence", seq);

    console.log("Three Bears ingestion complete. Sequence length:", seq.length);
}
