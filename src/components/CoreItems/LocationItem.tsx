import { locations } from "../../stores";
import { TimelineItem } from "./TimelineItem";
import "ol/ol.css";
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
import { get as getProjection } from "ol/proj";
import { getTransform } from "ol/proj";
import { transformExtent } from "ol/proj";

export class LocationItem extends TimelineItem {
    mapContainer: HTMLDivElement | null = null;

    renderCompact() {
        const loc = locations[this.details.locationId];
        return <h5 class="timeline-item location">{loc?.title ?? "Unknown Location"}</h5>;
    }

    renderCreateNew(props: {
        startTime: number;
        duration?: number;
        onChange: (field: string, value: any) => void;
    }) {
        return (
            <>
                <div class="field border label max">
                    <select
                        value={this.details.locationId ?? ""}
                        onChange={(e) => props.onChange("locationId", e.currentTarget.value)}
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
                        value={props.startTime ?? ""}
                        onInput={(e) => props.onChange("startTime", Number(e.currentTarget.value))}
                    />
                    <label>Start Time (seconds)</label>
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
        const loc = locations[this.details.locationId];
        if (!loc) return "Unknown Location";

        const lat = Number(loc.details?.lat ?? 0);
        const lng = Number(loc.details?.lng ?? 0);
        const radiusMeters = Number(loc.details?.radius ?? 100);

        return (
            <div class="timeline-item location padding">
                <h2>{loc.title}</h2>
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
                                    scale: 0.05,
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
            </div>
        );
    }
}
