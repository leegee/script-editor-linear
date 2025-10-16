import { createStore } from "solid-js/store";
import { Note } from "../components/CoreItems";
import { storage } from "../db";

export const [notes, setNotes] = createStore<Record<string, Note>>({});

export async function loadAllNotes() {
    const items = await storage.getAll<Note>("notes");
    const revived = Object.fromEntries(
        Object.entries(items).map(([id, obj]) => [id, new Note(obj)])
    );
    setNotes(revived);
}

export async function addNote(item: Note) {
    setNotes(item.id, item);
    await storage.put("notes", item);
}

export async function removeNote(id: string) {
    setNotes(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
    });
    await storage.delete("notes", id);
}
