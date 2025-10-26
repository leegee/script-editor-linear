import { LocationRenderMixin } from "./LocationRenderMixin";

/**
 * CanonicalLocation represents a real-world location.
 * It does NOT have a `ref`. TimelineLocationItem.details.ref points to its id.
 */
class BaseCanonicalLocation {
    id: string;
    title: string;
    details: { lat: number; lng: number; radius: number };

    constructor(obj: Partial<BaseCanonicalLocation>) {
        if (!obj.title) throw new TypeError("CanonicalLocation must have a title");

        const details: Partial<{ lat: number; lng: number; radius: number }> = obj.details ?? {};

        this.details = {
            lat: typeof details.lat === "number" ? details.lat : 0,
            lng: typeof details.lng === "number" ? details.lng : 0,
            radius: typeof details.radius === "number" ? details.radius : 100,
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
