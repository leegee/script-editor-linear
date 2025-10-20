import "ol/ol.css";
import { locations, setTimelineItems } from "../../stores";
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
import { For } from "solid-js";
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
        return (
            <>
                <div class="field border label max">
                    <select
                        value={this.details.ref ?? ""}
                        onChange={(e) => props.onChange("ref", e.currentTarget.value)}
                    >
                        <option value="" disabled>
                            Select a location
                        </option>
                        {Object.values(locations).map((loc) => (
                            <option value={loc.id}>{loc.title}</option>
                        ))}
                    </select>
                    <label>Select Location</label>
                </div>

                <div class="field border label max">
                    <input
                        type="number"
                        min={0}
                        value={props.duration ?? ""}
                        onInput={(e) => props.onChange("duration", Number(e.currentTarget.value))}
                    />
                    <label>Duration (seconds)</label>
                </div>
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
        <ul class="list border">
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
