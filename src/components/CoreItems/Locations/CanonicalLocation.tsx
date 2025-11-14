import { TimelineItem, TimelineItemProps } from "../TimelineItem";
import { LocationRenderMixin } from "./LocationRenderMixin";

/**
 * CanonicalLocation represents a real-world location.
 * It does NOT have a `ref`. TimelineLocationItem.details.ref points to its id.
 */
class BaseCanonicalLocation extends TimelineItem {
    id: string;
    title: string;
    details: { lat: number; lng: number; radius: number, text?: string };

    constructor(obj: Partial<BaseCanonicalLocation>) {
        super(obj as TimelineItemProps);
        if (!obj.title) throw new TypeError("CanonicalLocation must have a title");

        const details: Partial<{ lat: number; lng: number; radius: number, text: string }> = obj.details ?? {};

        this.details = {
            lat: typeof details.lat === "number" ? details.lat : 0,
            lng: typeof details.lng === "number" ? details.lng : 0,
            radius: typeof details.radius === "number" ? details.radius : 100,
            text: details.text ?? '',
        };

        this.id = obj.id ?? crypto.randomUUID();
        this.title = obj.title;
    }

    static revive(obj: any) {
        return new CanonicalLocation(obj);
    }
}

export const CanonicalLocation = LocationRenderMixin(BaseCanonicalLocation);
export type CanonicalLocationType = InstanceType<typeof CanonicalLocation>;
