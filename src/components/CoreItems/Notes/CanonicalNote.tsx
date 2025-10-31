import { type TimelineItem } from "../TimelineItem";
import { NoteRenderMixin } from "./NoteRenderMixin";

/**
 * CanonicalNote represents a note that can be attached to anything.
 * It does NOT have a `ref`. TimelineNOteItem.details.ref points to its id.
 */
class BaseCanonicalNote {
    id: string;
    title: string;
    details: Record<string, any>;

    static revive(obj: any) {
        return new CanonicalNote(obj);
    }

    constructor(obj: Partial<BaseCanonicalNote>) {
        if (!obj.title) {
            throw new TypeError(
                "CanonicalNote must have a title, but got " + JSON.stringify(obj, null, 2)
            );
        }

        this.id = obj.id ?? crypto.randomUUID();
        this.title = obj.title.trim();

        // If this is a new note (no createdAt), add it
        const details = obj.details ?? {};
        this.details = {
            ...details,
            createdAt: details.createdAt ?? new Date().toISOString(),
        };
    }

}

export const CanonicalNote = NoteRenderMixin(BaseCanonicalNote);
export type CanonicalNoteType = InstanceType<typeof CanonicalNote>;
