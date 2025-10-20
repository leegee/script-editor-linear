import { TimelineItemProps, CharacterItem, LocationItem } from "../components/CoreItems/";

export const sampleCharacters: CharacterItem[] = [
    new CharacterItem({ id: "Narrator", name: "Narrator" }),
    new CharacterItem({ id: "FatherBear", name: "Father Bear" }),
    new CharacterItem({ id: "MotherBear", name: "Mother Bear" }),
    new CharacterItem({ id: "BabyBear", name: "Baby Bear" }),
    new CharacterItem({ id: "Goldilocks", name: "Goldilocks" }),
];

export const sampleLocations: LocationItem[] = [
    new LocationItem({
        id: "cottage-1",
        title: "The Bears’ Cottage",
        details: { lat: 51.5074, lng: -0.1278, radius: 150 }
    }),
    new LocationItem({
        id: "forest-path-1",
        title: "Forest Path",
        details: { lat: 51.5076, lng: -0.1281, radius: 200 }
    }),
    new LocationItem({
        id: "cottage-inside-1",
        title: "Inside the Bears’ Cottage",
        details: { lat: 51.5075, lng: -0.1279, radius: 20 }
    })
];

export const sampleScript: TimelineItemProps[] = [
    { id: crypto.randomUUID(), type: "act", title: "Act 1", duration: 60 },

    { id: crypto.randomUUID(), type: "scene", title: "Scene 1", duration: 15 },
    { id: crypto.randomUUID(), type: "location", details: { ref: "cottage-1" } },

    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Narrator", text: "Once upon a time, there were three bears living together." }, duration: 5 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Narrator", text: "There was a great big father bear, a middle-sized mother bear, and a tiny little baby bear." }, duration: 5 },

    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "FatherBear", text: "Breakfast time! My porridge is far too hot." }, duration: 3 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "MotherBear", text: "Mine too, dear. Let’s take a little walk while it cools." }, duration: 3 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "BabyBear", text: "Yes, let’s go! I love walks!" }, duration: 2 },

    { id: crypto.randomUUID(), type: "scene", title: "Scene 2", duration: 15 },
    { id: crypto.randomUUID(), type: "location", details: { ref: "forest-path-1" } },

    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Narrator", text: "So the three bears set off for their walk in the woods." }, duration: 5 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Narrator", text: "While they were away, Goldilocks wandered along the same path." }, duration: 5 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Goldilocks", text: "What a lovely little house! I wonder who lives here..." }, duration: 5 },

    { id: crypto.randomUUID(), type: "scene", title: "Scene 3", duration: 20 },
    { id: crypto.randomUUID(), type: "location", details: { ref: "cottage-inside-1" } },

    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Narrator", text: "Goldilocks knocked at the door, but no one answered." }, duration: 3 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Goldilocks", text: "Mmm! What a delicious smell! Porridge!" }, duration: 3 },

    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Narrator", text: "On the table were three bowls of porridge." }, duration: 3 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Goldilocks", text: "Ouch! This porridge is too hot!" }, duration: 2 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Narrator", text: "She tasted the second bowl." }, duration: 2 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Goldilocks", text: "This one’s too cold." }, duration: 2 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Narrator", text: "Finally, she tasted the third bowl." }, duration: 2 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Goldilocks", text: "Ahh! This porridge is just right." }, duration: 2 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Narrator", text: "And she ate it all up." }, duration: 3 }
];
