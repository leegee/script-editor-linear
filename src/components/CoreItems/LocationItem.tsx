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

export class LocationItem extends TimelineItem {
    mapContainer: HTMLDivElement | null = null;
    declare title: string;

    constructor(props: Omit<TimelineItemProps, "type"> & { title: string; details: { lat: number; lng: number; radius: number } }) {
        super({ ...props, type: "location" });
    }

    renderCompact() {
        const loc = locations[this.title];
        return <h5 class="timeline-item location">{loc?.title ?? "Unknown Location"}</h5>;
    }

    renderCreateNew(props: {
        duration?: number;
        onChange: (field: string, value: any) => void;
    }) {
        return (
            <>
                <div class="field border label max">
                    <select
                        value={this.title ?? ""}
                        onChange={(e) => props.onChange("title", e.currentTarget.value)}
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
        const loc = locations[this.title];
        if (!loc) return "Unknown Location";

        const lat = Number(loc.details?.lat ?? 0);
        const lng = Number(loc.details?.lng ?? 0);
        const radiusMeters = Number(loc.details?.radius ?? 100);

        return (
            <fieldset class="location padding">
                <h2 class="field" style="block-size: unset">
                    <InlineEditable value={loc.title ?? "Untitled Location"}
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

                        // Create marker feature
                        const marker = new Feature({
                            geometry: new Point(center),
                        });
                        marker.setStyle(
                            new Style({
                                image: new Icon({
                                    src: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
                                    scale: 0.04,
                                    anchor: [0.5, 1],
                                }),
                            })
                        );

                        // Create circle feature (radius in metres)
                        const circleFeature = new Feature({
                            geometry: new Circle(center, radiusMeters),
                        });
                        circleFeature.setStyle(
                            new Style({
                                stroke: new Stroke({
                                    color: "rgba(239, 68, 68, 0.8)", // red
                                    width: 2,
                                }),
                                fill: new Fill({
                                    color: "rgba(239, 68, 68, 0.25)",
                                }),
                            })
                        );

                        const vectorSource = new VectorSource({
                            features: [circleFeature, marker],
                        });

                        const vectorLayer = new VectorLayer({
                            source: vectorSource,
                        });

                        const map = new Map({
                            target: el,
                            layers: [
                                new TileLayer({
                                    source: new OSM(),
                                }),
                                vectorLayer,
                            ],
                            view: new View({
                                center,
                                zoom: 14,
                            }),
                            controls: [],
                        });

                        // Fit to circle extent
                        const extent = circleFeature.getGeometry()?.getExtent();
                        if (extent) {
                            map.getView().fit(extent, { padding: [20, 20, 20, 20] });
                        }

                        this.mapContainer.dataset.mapInit = "true";
                    }}
                ></div>
            </fieldset>
        );
    }
}

export function reviveLocation(obj: any): LocationItem {
    let lat, lng, radius;
    if (!obj.title) throw new Error("Missing title");
    if (!obj.details) {
        ({ lat, lng, radius } = locations[obj.title].details);
    } else {
        ({ lat, lng, radius } = obj.details);
        if (typeof lat !== "number" || typeof lng !== "number" || typeof radius !== "number") {
            throw new Error("Invalid location details");
        }
    }

    return new LocationItem({
        ...obj,
        title: obj.title,
        details: { lat, lng, radius }
    });
}

export function ListLocations() {
    return <fieldset>
        <h2>Locations</h2>
        <For each={Object.values(locations)}>
            {(loc) => (
                <div>
                    {loc.title}
                </div>
            )}
        </For>
    </fieldset>
}
