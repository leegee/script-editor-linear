import { type TimelineItem } from "../TimelineItem";
import { NoteRenderMixin } from "./NoteRenderMixin";

/**
 * CanonicalNote represents a note that can be attached to anything.
 * It does NOT have a `ref`. TimelineNOteItem.details.ref points to its id.
 */
class BaseCanonicalNote {
    id: string;
    title: string;
    details: {};

    static revive(obj: any) {
        return new CanonicalNote(obj);
    }

    constructor(obj: Partial<BaseCanonicalNote>) {
        if (!obj.title) throw new TypeError("CanonicalNote must have a title");

        const details: Partial<{}> = obj.details ?? {};

        this.details = {
            ...details
        };

        this.id = obj.id ?? crypto.randomUUID();
        this.title = obj.title;
    }

}

export const CanonicalNote = NoteRenderMixin(BaseCanonicalNote);
export type CanonicalNoteType = InstanceType<typeof CanonicalNote>;
