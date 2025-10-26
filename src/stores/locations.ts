import { createStore, unwrap } from "solid-js/store";
import { storage } from "../db";
import { CanonicalLocation, type CanonicalLocationType } from "../components/CoreItems/Locations/CanonicalLocation";
import { TimelineLocationItemType } from "../components/CoreItems";

export const [locations, setLocations] = createStore<Record<string, CanonicalLocationType>>({});

export async function loadAllLocations() {
    const items = await storage.getAll<CanonicalLocationType>("locations");
    const revived = Object.fromEntries(
        Object.entries(items).map(([id, obj]) => [id, CanonicalLocation.revive(obj)])
    );
    setLocations(revived);
}

export async function resetLocations() {
    await storage.clearTable("locations");
    setLocations({});
}

export async function addLocation(item: CanonicalLocationType) {
    if (Object.hasOwn(item, 'ref')) {
        throw new TypeError('addLocation fields should not contain ref, this is a Canonical Location');
    }

    setLocations(item.id, item);
    await storage.put("locations", item);
    console.log('Added canonical location', item.id, item)
}

export async function updateLocation(id: string, updatedFields: Partial<CanonicalLocationType>) {
    if (Object.hasOwn(updatedFields, 'ref')) {
        throw new TypeError('updateLocation fields should not contain ref, this is a Canonical Location');
    }
    setLocations(id, prev => ({
        ...(prev ?? {}),
        ...updatedFields,
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

export function resolveTimelineRef(item: TimelineLocationItemType): CanonicalLocationType | undefined {
    const ref = item.details?.ref ?? item.id;
    return locations[ref];
}