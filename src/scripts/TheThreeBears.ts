import { TimelineItemProps, LocationItem, Character } from "../classes/CoreItems";

export const sampleCharacters: Character[] = [
    new Character({ id: "Narrator", name: "Narrator" }),
    new Character({ id: "FatherBear", name: "Father Bear" }),
    new Character({ id: "MotherBear", name: "Mother Bear" }),
    new Character({ id: "BabyBear", name: "Baby Bear" }),
    new Character({ id: "Goldilocks", name: "Goldilocks" }),
];

export const sampleLocations: LocationItem[] = [
    new LocationItem({
        id: "cottage-1",
        type: "location",
        title: "The Bears’ Cottage",
        details: { lat: 51.5074, lng: -0.1278, radius: 150 }
    }),
    new LocationItem({
        id: "forest-path-1",
        type: "location",
        title: "Forest Path",
        details: { lat: 51.5076, lng: -0.1281, radius: 200 }
    }),
    new LocationItem({
        id: "cottage-inside-1",
        type: "location",
        title: "Inside the Bears’ Cottage",
        details: { lat: 51.5075, lng: -0.1279, radius: 120 }
    })
];

export const sampleScript: TimelineItemProps[] = [
    { id: crypto.randomUUID(), type: "act", title: "Act 1", startTime: 0, duration: 60 },

    { id: crypto.randomUUID(), type: "scene", title: "Scene 1", startTime: 0, duration: 15 },
    { id: crypto.randomUUID(), type: "location", details: { locationId: "cottage-1" }, startTime: 0, duration: 0 },

    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Narrator", text: "Once upon a time, there were three bears living together." }, startTime: 1, duration: 5 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Narrator", text: "There was a great big father bear, a middle-sized mother bear, and a tiny little baby bear." }, startTime: 6, duration: 5 },

    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "FatherBear", text: "Breakfast time! My porridge is far too hot." }, startTime: 11, duration: 3 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "MotherBear", text: "Mine too, dear. Let’s take a little walk while it cools." }, startTime: 14, duration: 3 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "BabyBear", text: "Yes, let’s go! I love walks!" }, startTime: 17, duration: 2 },

    { id: crypto.randomUUID(), type: "scene", title: "Scene 2", startTime: 19, duration: 15 },
    { id: crypto.randomUUID(), type: "location", details: { locationId: "forest-path-1" }, startTime: 19, duration: 0 },

    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Narrator", text: "So the three bears set off for their walk in the woods." }, startTime: 20, duration: 5 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Narrator", text: "While they were away, Goldilocks wandered along the same path." }, startTime: 25, duration: 5 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Goldilocks", text: "What a lovely little house! I wonder who lives here..." }, startTime: 30, duration: 5 },

    { id: crypto.randomUUID(), type: "scene", title: "Scene 3", startTime: 35, duration: 20 },
    { id: crypto.randomUUID(), type: "location", details: { locationId: "cottage-inside-1" }, startTime: 35, duration: 0 },

    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Narrator", text: "Goldilocks knocked at the door, but no one answered." }, startTime: 36, duration: 3 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Goldilocks", text: "Mmm! What a delicious smell! Porridge!" }, startTime: 39, duration: 3 },

    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Narrator", text: "On the table were three bowls of porridge." }, startTime: 42, duration: 3 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Goldilocks", text: "Ouch! This porridge is too hot!" }, startTime: 45, duration: 2 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Narrator", text: "She tasted the second bowl." }, startTime: 47, duration: 2 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Goldilocks", text: "This one’s too cold." }, startTime: 49, duration: 2 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Narrator", text: "Finally, she tasted the third bowl." }, startTime: 51, duration: 2 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Goldilocks", text: "Ahh! This porridge is just right." }, startTime: 53, duration: 2 },
    { id: crypto.randomUUID(), type: "dialogue", details: { characterId: "Narrator", text: "And she ate it all up." }, startTime: 55, duration: 3 }
];
