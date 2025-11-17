import { createStore, unwrap } from "solid-js/store";
import { storage } from "../db";
import { Note, NoteProps } from "../components/CoreItems/Note";

export const [notes, setNotes] = createStore<Record<string, Note>>({});

export async function loadAllNotesFromStorage() {
    const items = await storage.getAll<NoteProps>("notes");
    const revived = Object.fromEntries(
        Object.entries(items).map(([id, props]) => [id, Note.revive(props)])
    );
    setNotes(revived);
}

export async function resetNotes() {
    await storage.clearTable("notes");
    setNotes({});
}

export function addNote(obj: Partial<NoteProps>): Note {
    if ("ref" in obj) {
        throw new TypeError("createNote fields should not contain ref");
    }

    const note: Note = Note.revive({
        id: obj.id ?? crypto.randomUUID(),
        title: obj.title ?? "New note",
        details: {
            text: obj.details?.text ?? "",
            urls: obj.details?.urls ?? [],
        },
    });

    setNotes(note.id, note);
    storage.put("notes", note);

    return note;
}

export function patchNote(id: string, updatedFields: Partial<NoteProps>) {
    const prev = unwrap(notes[id]);
    if (!prev) throw new Error("Cannot patch non-existent note: " + id);

    const merged = {
        ...prev,
        ...updatedFields,
        details: {
            ...prev.details,
            ...(updatedFields.details ?? {}),
        },
    };

    setNotes(id, merged);
    storage.put("notes", unwrap(merged));
}


export async function removeNote(id: string) {
    setNotes(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
    });
    await storage.delete("notes", id);
}

export function getNote(id: string): Note | undefined {
    return notes[id];
}

export function resolveNoteRef(item: { details?: { ref?: string }; id?: string }): Note | undefined {
    const ref = item.details?.ref ?? item.id;
    return ref ? notes[ref] : undefined;
}
