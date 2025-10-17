import { createStore } from "solid-js/store";
import { Character } from "../components/CoreItems/";
import { storage } from "../db";

export const [characters, setCharacters] = createStore<Record<string, Character>>({});

export async function loadAllCharacters() {
    const items = await storage.getAll<Character>("characters");
    const revived = Object.fromEntries(
        Object.entries(items).map(([id, obj]) => [id, new Character(obj)])
    );
    setCharacters(revived);
}

export async function addCharacter(item: Character) {
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
