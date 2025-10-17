export class Location {
    id!: string;
    title!: string;
    details?: {
        lat?: number;
        lng?: number;
        radius?: number;
        address?: string;
        description?: string;
    };
    notes?: string[];

    constructor(data: Partial<Location>) {
        Object.assign(this, data);
    }

    renderCompact() {
        return this.title;
    }

    renderFull() {
        const { lat, lng, address, description } = this.details ?? {};
        return (
            <div class="location-detail">
                <strong>{this.title}</strong>
                {address && <div>{address}</div>}
                {(lat !== undefined && lng !== undefined) && (
                    <div>Lat: {lat}, Lng: {lng}</div>
                )}
                {description && <div>{description}</div>}
            </div>
        );
    }
}

export function reviveLocation(obj: any) { return new Location(obj); }