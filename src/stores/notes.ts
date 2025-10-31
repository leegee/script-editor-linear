import { createStore, unwrap } from "solid-js/store";
import { storage } from "../db";
import { CanonicalNote, type CanonicalNoteType } from "../components/CoreItems/Notes/CanonicalNote";
import { TimelineNoteItemType } from "../components/CoreItems";

export const [notes, setNotes] = createStore<Record<string, CanonicalNoteType>>({});

export async function loadAllNotes() {
    const items = await storage.getAll<CanonicalNoteType>("notes");
    const revived = Object.fromEntries(
        Object.entries(items).map(([id, obj]) => [id, CanonicalNote.revive(obj)])
    );
    setNotes(revived);
}

export async function resetNotes() {
    await storage.clearTable("notes");
    setNotes({});
}

export async function addNote(item: CanonicalNoteType) {
    if (Object.hasOwn(item, 'ref')) {
        throw new TypeError('addNote fields should not contain ref, this is a Canonical Note');
    }

    setNotes(item.id, item);
    await storage.put("notes", item);
    console.log('Added canonical note', item.id, item)
}

export async function updateNote(id: string, updatedFields: Partial<CanonicalNoteType>) {
    if (Object.hasOwn(updatedFields, 'ref')) {
        throw new TypeError('updateNote fields should not contain ref, this is a Canonical Note');
    }

    // Merge fields and revive to ensure methods from NoteRenderMixin are preserved
    const prev = unwrap(notes[id]) as CanonicalNoteType | undefined;
    const merged = {
        ...(prev as any),
        ...updatedFields,
        details: {
            ...((prev as any)?.details ?? {}),
            ...((updatedFields as any).details ?? {})
        }
    } as any;

    const revived = CanonicalNote.revive(merged);
    setNotes(id, revived);

    await storage.put("notes", unwrap(revived));
}

export async function removeNote(id: string) {
    setNotes(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
    });
    await storage.delete("notes", id);
}

export function resolveNoteRef(item: TimelineNoteItemType): CanonicalNoteType | undefined {
    const ref = item.details?.ref ?? item.id;
    return notes[ref];
}