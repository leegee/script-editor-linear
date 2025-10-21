import "ol/ol.css";
import { createSignal, For } from "solid-js";
import { A } from "@solidjs/router";

import Map from "ol/Map";
import View from "ol/View";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM } from "ol/source";
import VectorSource from "ol/source/Vector";
import { Feature } from "ol";
import Point from "ol/geom/Point";
import Circle from "ol/geom/Circle";
import { Style, Fill, Stroke, Icon } from "ol/style";
import Modify from "ol/interaction/Modify";
import { fromLonLat, toLonLat } from "ol/proj";

import { addLocation, locations, setLocations, updateLocation } from "../../stores";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";
import InlineEditable from "../InlineEditable";

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


    renderEditableMap(
        el: HTMLDivElement,
        lat: number,
        lng: number,
        radius: number,
        onChange: (lat: number, lng: number, radius: number) => void
    ) {
        const center = fromLonLat([lng, lat]);

        const pointFeature = new Feature({ geometry: new Point(center) });
        const circleFeature = new Feature({ geometry: new Circle(center, radius) });

        pointFeature.setStyle(
            new Style({
                image: new Icon({
                    src: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
                    scale: 0.04,
                    anchor: [0.5, 1],
                }),
            })
        );
        circleFeature.setStyle(
            new Style({
                stroke: new Stroke({ color: "rgba(239, 68, 68, 0.8)", width: 2 }),
                fill: new Fill({ color: "rgba(239, 68, 68, 0.25)" }),
            })
        );

        const vectorSource = new VectorSource({ features: [circleFeature, pointFeature] });
        const vectorLayer = new VectorLayer({ source: vectorSource });

        const map = new Map({
            target: el,
            layers: [new TileLayer({ source: new OSM() }), vectorLayer],
            view: new View({ center, zoom: 14 }),
            controls: [],
        });

        const modify = new Modify({ source: vectorSource });
        map.addInteraction(modify);

        modify.on("modifyend", () => {
            const coords = toLonLat((pointFeature.getGeometry() as Point).getCoordinates());
            const newRadius = (circleFeature.getGeometry() as Circle).getRadius();
            onChange(coords[1], coords[0], newRadius);
        });
    }

    renderCompact() {
        const canonical = locations[this.details.ref ?? this.id];
        return <h4 class="timeline-item location">{canonical?.title ?? "Unknown Location"}</h4>;
    }


    renderFull() {
        const canonical = locations[this.details.ref ?? this.id];
        if (!canonical) return "Unknown Location";

        console.log(canonical);

        const save = () => {
            updateLocation(canonical.id, {
                title: canonical.title,
                details: canonical.details,
            });
        };

        return (
            <fieldset class="location padding">
                <h4 class="field" style="block-size: unset">
                    <InlineEditable
                        value={canonical.title ?? "Untitled Location"}
                        onUpdate={(v) => {
                            canonical.title = v;
                            save();
                        }}
                    />
                </h4>

                <div>
                    Lat: {canonical.details.lat ?? 0}, Lng: {canonical.details.lng ?? 0}, Radius: {canonical.details.radius ?? 100} m
                </div>

                <div
                    class="padding"
                    style={{ width: "100%", height: "15em" }}
                    ref={(el) => {
                        if (!el) return;
                        this.mapContainer = el;
                        if (this.mapContainer.dataset.mapInit) return;

                        this.renderEditableMap(
                            el,
                            canonical.details.lat ?? 0,
                            canonical.details.lng ?? 0,
                            canonical.details.radius ?? 100,
                            (lat, lng, radius) => {
                                canonical.details.lat = lat;
                                canonical.details.lng = lng;
                                canonical.details.radius = radius;
                                save();
                            }
                        );

                        this.mapContainer.dataset.mapInit = "true";
                    }}
                ></div>
            </fieldset>
        );
    }

    renderCreateNew(props: { duration?: number; onChange: (field: string, value: any) => void }) {
        const [mode, setMode] = createSignal<"select" | "new">("select");

        return (
            <>
                <div class="field border label max">
                    <select value={mode()} onChange={(e) => setMode(e.currentTarget.value as "select" | "new")}>
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
                                value={this.details.title ?? ""}
                                onInput={(e) => {
                                    props.onChange("title", e.currentTarget.value);
                                    this.details.title = e.currentTarget.value;
                                }}
                            />
                            <label>Title</label>
                        </div>

                        <div
                            class="padding"
                            style={{ width: "100%", height: "15em" }}
                            ref={(el) => {
                                if (!el) return;
                                this.renderEditableMap(
                                    el,
                                    this.details.lat ?? 0,
                                    this.details.lng ?? 0,
                                    this.details.radius ?? 100,
                                    (lat, lng, radius) => {
                                        props.onChange("lat", lat);
                                        props.onChange("lng", lng);
                                        props.onChange("radius", radius);
                                        this.details.lat = lat;
                                        this.details.lng = lng;
                                        this.details.radius = radius;
                                    }
                                );
                            }}
                        ></div>
                    </>
                )}

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


    prepareFromFields(fields: Record<string, any>) {
        let ref = fields.ref;

        if (!ref) {
            const loc = new LocationItem({
                id: fields.id ?? fields.title.replace(/[^\p{L}\p{N}_]/gu, ''),
                title: fields.title ?? "Untitled Location",
                details: {
                    lat: fields.lat ?? 0,
                    lng: fields.lng ?? 0,
                    radius: fields.radius ?? 100,
                }
            });
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
    return (
        <fieldset>
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
    );
}
