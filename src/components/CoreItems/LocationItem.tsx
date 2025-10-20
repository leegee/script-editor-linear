import "ol/ol.css";
import { addLocation, locations, setLocations, setTimelineItems } from "../../stores";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";
import Map from "ol/Map";
import View from "ol/View";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM } from "ol/source";
import VectorSource from "ol/source/Vector";
import { fromLonLat } from "ol/proj";
import { Feature } from "ol";
import Point from "ol/geom/Point";
import Circle from "ol/geom/Circle";
import { Style, Fill, Stroke, Icon } from "ol/style";
import InlineEditable from "../InlineEditable";
import { createSignal, For, Show } from "solid-js";
import { A } from "@solidjs/router";

export class LocationItem extends TimelineItem {
    mapContainer: HTMLDivElement | null = null;

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
        return <h5 class="timeline-item location">{canonical?.title ?? "Unknown Location"}</h5>;
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
                <h2 class="field" style="block-size: unset">
                    <InlineEditable
                        value={canonical.title ?? "Untitled Location"}
                        onUpdate={(v) => setTimelineItems(this.id, "title", v)}
                    />
                </h2>

                <div>
                    Lat: {lat}, Lng: {lng}, Radius: {radiusMeters} m
                </div>

                <div
                    class="padding"
                    style={{ width: "100%", height: "15em" }}
                    ref={(el) => {
                        if (!el) return;
                        this.mapContainer = el;
                        if (this.mapContainer.dataset.mapInit) return;

                        const center = fromLonLat([lng, lat]);

                        const marker = new Feature({ geometry: new Point(center) });
                        marker.setStyle(
                            new Style({
                                image: new Icon({
                                    src: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
                                    scale: 0.04,
                                    anchor: [0.5, 1],
                                }),
                            })
                        );

                        const circleFeature = new Feature({ geometry: new Circle(center, radiusMeters) });
                        circleFeature.setStyle(
                            new Style({
                                stroke: new Stroke({ color: "rgba(239, 68, 68, 0.8)", width: 2 }),
                                fill: new Fill({ color: "rgba(239, 68, 68, 0.25)" }),
                            })
                        );

                        const vectorLayer = new VectorLayer({ source: new VectorSource({ features: [circleFeature, marker] }) });

                        new Map({
                            target: el,
                            layers: [new TileLayer({ source: new OSM() }), vectorLayer],
                            view: new View({ center, zoom: 14 }),
                            controls: [],
                        });

                        this.mapContainer.dataset.mapInit = "true";
                    }}
                ></div>
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

// Revive both canonical and reference items
export function reviveLocation(obj: any): LocationItem {
    return new LocationItem({
        ...obj,
        details: obj.details ?? { ref: obj.title ?? obj.id },
    });
}

export function ListLocations() {
    return <fieldset>
        <h2>Locations</h2>
        <ul class="list border no-space">
            <For each={Object.values(locations)}>
                {(loc) => (
                    <li>
                        <A href={"/item/" + loc.id}>{loc.title}</A>
                    </li>
                )}
            </For>
        </ul>
    </fieldset>
}

