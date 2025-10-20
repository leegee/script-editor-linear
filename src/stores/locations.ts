import { createStore } from "solid-js/store";
import { LocationItem } from "../components/CoreItems/LocationItem";
import { storage } from "../db";

export const [locations, setLocations] = createStore<Record<string, LocationItem>>({});

export async function loadAllLocations() {
    const items = await storage.getAll<LocationItem>("locations");
    const revived = Object.fromEntries(
        Object.entries(items).map(([id, obj]) => [id, LocationItem.revive(obj)])
    );
    setLocations(revived);
}

export async function addLocation(item: LocationItem) {
    setLocations(item.id, item);
    await storage.put("locations", item);
}

export async function removeLocation(id: string) {
    setLocations(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
    });
    await storage.delete("locations", id);
}
