import "ol/ol.css";
import { createSignal, For } from "solid-js";
import { A } from "@solidjs/router";
import { locations, setLocations, addLocation, updateLocation } from "../../../stores";
import { TimelineItem, TimelineItemProps } from "../TimelineItem";
import InlineEditable from "../../InlineEditable";
import { LocationMap } from "./LocationMap";
import { CanonicalLocation } from "./CanonicalLocation";


export class TimelineLocationItem extends TimelineItem {
    static revive(obj: any): TimelineLocationItem {
        // Old data migration — create reference-only item
        return new TimelineLocationItem({
            ...obj,
            details: obj.details?.ref
                ? obj.details
                : { ref: obj.id }, // fallback for legacy inline items
        });
    }

    constructor(props: Omit<TimelineItemProps, "type">) {
        const ref = props.details?.ref ?? props.id;
        const canonical = locations[ref];

        super({
            ...props,
            id: props.id || crypto.randomUUID(),
            type: "location",
            title: props.title ?? canonical?.title ?? "Untitled Location",
            details: {
                ref,
                ...props.details,
            },
        });
    }

    renderCompact() {
        const canonical = locations[this.details.ref ?? this.id];
        return (
            <h4 class="timeline-item location">
                {canonical?.title ?? "Unknown Location"}
            </h4>
        );
    }

    renderCreateNew(props: { duration?: number; onChange: (field: string, value: any) => void }) {
        const [mode, setMode] = createSignal<"select" | "new">("select");

        return (
            <>
                <div class="field border label max">
                    <select
                        value={mode()}
                        onChange={(e) => setMode(e.currentTarget.value as "select" | "new")}
                    >
                        <option value="select">Select Existing</option>
                        <option value="new">Create New</option>
                    </select>
                    <label>Mode</label>
                </div>

                {mode() === "new" && (
                    <>
                        <div class="field border label max">
                            <input
                                type="text"
                                onInput={(e) => props.onChange("title", e.currentTarget.value)}
                            />
                            <label>Title</label>
                        </div>
                        <div class="field border label max">
                            <input
                                type="number"
                                placeholder="Latitude"
                                onInput={(e) =>
                                    props.onChange("lat", parseFloat(e.currentTarget.value))
                                }
                            />
                            <label>Latitude</label>
                        </div>
                        <div class="field border label max">
                            <input
                                type="number"
                                placeholder="Longitude"
                                onInput={(e) =>
                                    props.onChange("lng", parseFloat(e.currentTarget.value))
                                }
                            />
                            <label>Longitude</label>
                        </div>
                        <div class="field border label max">
                            <input
                                type="number"
                                placeholder="Radius (metres)"
                                onInput={(e) =>
                                    props.onChange("radius", parseFloat(e.currentTarget.value))
                                }
                            />
                            <label>Radius</label>
                        </div>
                    </>
                )}

                {mode() === "select" && (
                    <div class="field border label max">
                        <select
                            value={this.details.ref ?? ""}
                            onChange={(e) => props.onChange("ref", e.currentTarget.value)}
                        >
                            <option value="" disabled>
                                Select a Location
                            </option>
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
        const canonical: CanonicalLocation | undefined =
            locations[this.details.ref ?? this.id];
        if (!canonical) return <p>Unknown Location</p>;

        const { lat, lng, radius } = canonical.details;

        return (
            <fieldset class="location padding">
                <h4 class="field">
                    <InlineEditable
                        value={canonical.title ?? "Untitled Location"}
                        onUpdate={(v) => updateLocation(canonical.id, { title: v })}
                    />
                </h4>

                <div>
                    Lat: {lat}, Lng: {lng}, Radius: {radius} m
                </div>

                <LocationMap
                    lat={lat}
                    lng={lng}
                    radius={radius}
                    onChange={(newLat, newLng, newRadius) => {
                        updateLocation(canonical.id, {
                            details: { lat: newLat, lng: newLng, radius: newRadius },
                        });
                    }}
                />
            </fieldset>
        );
    }

    prepareFromFields(fields: Record<string, any>) {
        let ref = fields.ref;

        // If no reference, create a new canonical location
        if (!ref) {
            const id =
                fields.id ??
                fields.title?.replace(/[^\p{L}\p{N}_]/gu, "") ??
                crypto.randomUUID();

            const newCanonical: CanonicalLocation = {
                id,
                type: "location",
                title: fields.title ?? "Untitled Location",
                details: {
                    lat: fields.lat ?? 0,
                    lng: fields.lng ?? 0,
                    radius: fields.radius ?? 100,
                },
            };

            setLocations(newCanonical.id, newCanonical);
            addLocation(newCanonical);
            ref = newCanonical.id;
        }

        return {
            type: "location",
            title: fields.title,
            duration: fields.duration,
            details: { ref },
        };
    }
}

/**
 * Displays all canonical locations in the store
 */
export function ListLocations() {
    return (
        <fieldset>
            <h2>Locations</h2>
            <ul class="list border no-space">
                <For each={Object.values(locations)}>
                    {(loc) => (
                        <li>
                            <A href={`/location/${loc.id}`}>{loc.title}</A>
                        </li>
                    )}
                </For>
            </ul>
        </fieldset>
    );
}
