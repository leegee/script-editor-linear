import "ol/ol.css";
import { createSignal, For } from "solid-js";
import { A } from "@solidjs/router";
import { addLocation, locations, setLocations, updateLocation } from "../../stores";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";
import InlineEditable from "../InlineEditable";
import { LocationMap } from "./LocationItem/LocationMap";

export class LocationItem extends TimelineItem {
    mapContainer: HTMLDivElement | null = null;

    static revive(obj: any): LocationItem {
        return new LocationItem({
            ...obj,
            details: obj.details ?? { ref: obj.title ?? obj.id },
        });
    }

    constructor(props: Omit<TimelineItemProps, "type">) {
        const canonicalId = props.details?.ref ?? props.id;
        const canonical = locations[canonicalId];

        // If a reference exists, fill in missing details from the canonical object
        const details = {
            lat: props.details?.lat ?? canonical?.details.lat ?? 0,
            lng: props.details?.lng ?? canonical?.details.lng ?? 0,
            radius: props.details?.radius ?? canonical?.details.radius ?? 1,
            ref: canonicalId,
        };

        super({
            ...props,
            id: props.id || crypto.randomUUID(),
            type: "location",
            title: props.title ?? canonical?.title ?? "",
            details,
        });
    }

    renderCompact() {
        const canonical = locations[this.details.ref ?? this.id];
        return <h4 class="timeline-item location">{canonical?.title ?? "Unknown Location"}</h4>;
    }

    renderCreateNew(props: { duration?: number; onChange: (field: string, value: any) => void }) {
        const [mode, setMode] = createSignal<"select" | "new">("select");

        return (
            <>
                {/* Mode toggle */}
                <div class="field border label max">
                    <select value={mode()} onChange={(e) => setMode(e.currentTarget.value as "select" | "new")}>
                        <option value="select">Select Existing</option>
                        <option value="new">Create New</option>
                    </select>
                    <label>Mode</label>
                </div>

                {/* New location inputs */}
                {mode() === "new" && (
                    <>
                        <div class="field border label max">
                            <input
                                type="text"
                                value={this.details.title ?? ""}
                                onInput={(e) => props.onChange("title", e.currentTarget.value)}
                            />
                            <label>Title</label>
                        </div>
                        <div class="field border label max">
                            <input
                                type="number"
                                value={this.details.lat ?? 0}
                                onInput={(e) => props.onChange("lat", parseFloat(e.currentTarget.value))}
                            />
                            <label>Latitude</label>
                        </div>
                        <div class="field border label max">
                            <input
                                type="number"
                                value={this.details.lng ?? 0}
                                onInput={(e) => props.onChange("lng", parseFloat(e.currentTarget.value))}
                            />
                            <label>Longitude</label>
                        </div>
                        <div class="field border label max">
                            <input
                                type="number"
                                value={this.details.radius ?? 100}
                                onInput={(e) => props.onChange("radius", parseFloat(e.currentTarget.value))}
                            />
                            <label>Radius (metres)</label>
                        </div>
                    </>
                )}

                {/* Existing location selector */}
                {mode() === "select" && (
                    <div class="field border label max">
                        <select
                            value={this.details.ref ?? ""}
                            onChange={(e) => props.onChange("ref", e.currentTarget.value)}
                        >
                            <option value="" disabled>Select a Location</option>
                            {Object.values(locations).map((loc) => (
                                <option value={loc.id}>{loc.title}</option>
                            ))}
                        </select>
                        <label>Existing Location</label>
                    </div>
                )}
            </>
        );
    }


    renderFull() {
        const canonical = locations[this.details.ref ?? this.id];
        if (!canonical) return "Unknown Location";

        const lat = Number(this.details.lat ?? canonical.details.lat);
        const lng = Number(this.details.lng ?? canonical.details.lng);
        const radiusMeters = Number(this.details.radius ?? canonical.details.radius);

        return (
            <fieldset class="location padding">
                <h4 class="field">
                    <InlineEditable
                        value={canonical.title ?? "Untitled Location"}
                        onUpdate={(v) => updateLocation(canonical.id, { title: v })}
                    />
                </h4>

                <div>
                    Lat: {lat}, Lng: {lng}, Radius: {radiusMeters} m
                </div>

                <LocationMap
                    lat={lat}
                    lng={lng}
                    radius={radiusMeters}
                    onChange={(newLat, newLng, newRadius) => {
                        // Update canonical object in the store
                        updateLocation(canonical.id, {
                            details: {
                                lat: newLat,
                                lng: newLng,
                                radius: newRadius,
                            }
                        });

                        // Also update LocationItem details so UI stays reactive
                        this.details.lat = newLat;
                        this.details.lng = newLng;
                        this.details.radius = newRadius;
                    }}
                />
            </fieldset>
        );

    }

    prepareFromFields(fields: Record<string, any>) {
        let ref = fields.ref;

        // If no ref, create a new location
        if (!ref) {
            const loc = new LocationItem({
                id: fields.id ?? fields.title.replace(/[^\p{L}\p{N}_]/gu, ''),
                title: fields.title ?? "Untitled Location",
                details: {
                    lat: fields.lat ?? 0,
                    lng: fields.lng ?? 0,
                    radius: fields.radius ?? 100
                }
            });
            setLocations(loc.id, loc);
            addLocation(loc);
            ref = loc.id;
        }

        return {
            type: "location",
            title: fields.title,
            duration: fields.duration,
            details: { ...fields, ref }
        };
    }
}

export function ListLocations() {
    return <fieldset>
        <h2>Locations</h2>
        <ul class="list border no-space">
            <For each={Object.values(locations)}>
                {(loc) => (
                    <li>
                        <A href={"/location/" + loc.id}>{loc.title}</A>
                    </li>
                )}
            </For>
        </ul>
    </fieldset>
}

