import { createStore } from "solid-js/store";
import { Location } from "../components/CoreItems";
import { storage } from "../db";

export const [locations, setLocations] = createStore<Record<string, Location>>({});

export async function loadAllLocations() {
    const items = await storage.getAll<Location>("locations");
    const revived = Object.fromEntries(
        Object.entries(items).map(([id, obj]) => [id, new Location(obj)])
    );
    setLocations(revived);
}

export async function addLocation(item: Location) {
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
