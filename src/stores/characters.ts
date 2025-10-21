import { createStore, unwrap } from "solid-js/store";
import { CharacterItem, LocationItem } from "../components/CoreItems/";
import { storage } from "../db";

export const [characters, setCharacters] = createStore<Record<string, CharacterItem>>({});

export async function loadAllCharacters() {
    const items = await storage.getAll<CharacterItem>("characters");
    const revived = Object.fromEntries(
        Object.entries(items).map(([id, obj]) => [id, CharacterItem.revive(obj)])
    );
    setCharacters(revived);
}

export async function resetCharacters() {
    setCharacters({});
    await storage.clearTable("characters");
}

export async function addCharacter(item: CharacterItem) {
    setCharacters(item.id, item);
    await storage.put("characters", item);
}

export async function removeCharacter(id: string) {
    setCharacters(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
    });
    await storage.delete("characters", id);
}

export async function updateCharacters(id: string, updatedFields: Partial<CharacterItem>) {
    setCharacters(id, prev => ({
        ...(prev ?? {}),
        ...updatedFields
    }));

    const loc = unwrap(characters[id]);
    const updated = { ...loc, ...updatedFields };

    await storage.put("locations", updated);
}

