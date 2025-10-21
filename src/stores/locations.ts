import { createStore, unwrap } from "solid-js/store";
import { storage } from "../db";
import { CanonicalLocation } from "../components/CoreItems/Locations/CanonicalLocation";
import { TimelineLocationItem } from "../components/CoreItems";

export const [locations, setLocations] = createStore<Record<string, CanonicalLocation>>({});

export async function loadAllLocations() {
    const items = await storage.getAll<CanonicalLocation>("locations");
    const revived = Object.fromEntries(
        Object.entries(items).map(([id, obj]) => [id, CanonicalLocation.revive(obj)])
    );
    setLocations(revived);
}

export async function resetLocations() {
    setLocations({});
    await storage.clearTable("locations");
}

export async function addLocation(item: CanonicalLocation) {
    setLocations(item.id, item);
    await storage.put("locations", item);
}

export async function updateLocation(id: string, updatedFields: Partial<CanonicalLocation>) {
    setLocations(id, prev => ({
        ...(prev ?? {}),
        ...updatedFields,
        // merge nested details if provided
        details: {
            ...(prev?.details ?? {}),
            ...(updatedFields.details ?? {})
        }
    }));

    const loc = unwrap(locations[id]);
    const updated = { ...loc };
    await storage.put("locations", updated);
}

export async function removeLocation(id: string) {
    setLocations(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
    });
    await storage.delete("locations", id);
}

export function resolveTimelineRef(item: TimelineLocationItem): CanonicalLocation | undefined {
    const ref = item.details?.ref ?? item.id;
    return locations[ref];
}