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
        if (!obj.title) throw new TypeError('CanonicalLocation must have a title');
        if (!obj.details) throw new TypeError('CanonicalLocation must have details (lat, lng, radius)');
        this.id = obj.id ?? crypto.randomUUID();
        this.title = obj.title;
        this.details = {
            lat: obj.details.lat,
            lng: obj.details.lng,
            radius: obj.details.radius,
        };
    }

    static revive(obj: any) {
        return new CanonicalLocation(obj);
    }
}

export const CanonicalLocation = LocationRenderMixin(BaseCanonicalLocation);
export type CanonicalLocationType = InstanceType<typeof CanonicalLocation>;

