import { createStore, unwrap } from "solid-js/store";
import { CharacterItem } from "../components/CoreItems/";
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
    await storage.clearTable("characters");
    setCharacters({});
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

export async function updateCharacter(id: string, updatedFields: Partial<CharacterItem>) {
    setCharacters(id, prev => ({
        ...(prev ?? {}),
        ...updatedFields
    }));

    await storage.put("characters", unwrap(characters[id]));
}

