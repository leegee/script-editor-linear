// CanonicalLocation.ts
export class CanonicalLocation {
    id: string;
    type: "location" = "location";
    title: string;
    details: {
        lat: number;
        lng: number;
        radius: number;
    };

    constructor(obj: Partial<CanonicalLocation>) {
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
