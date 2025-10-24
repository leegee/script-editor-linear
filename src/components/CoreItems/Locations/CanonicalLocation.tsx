import { TimelineItemProps } from "../TimelineItem";
import { TimelineLocationItem } from "./TimelineLocationItem";

export type CanonicalLocationProps = {
    id: string;
    title: string;
    details: {
        lat: number;
        lng: number;
        radius: number;
    },
}

export class CanonicalLocation extends TimelineLocationItem {
    id: string;
    type: "location" = "location";
    title: string;
    details: {
        lat: number;
        lng: number;
        radius: number;
    };

    constructor(obj: Partial<CanonicalLocation>) {
        super(obj as TimelineItemProps);
        this.id = obj.id ?? crypto.randomUUID();
        this.title = obj.title ?? "";
        this.details = {
            lat: obj.details?.lat ?? 0,
            lng: obj.details?.lng ?? 0,
            radius: obj.details?.radius ?? 100,
        };
    }

    static revive(obj: any): CanonicalLocation {
        return new CanonicalLocation(obj);
    }
}
