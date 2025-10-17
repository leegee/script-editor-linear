import { locations } from "../../stores";
import { TimelineItem } from "./TimelineItem";
import maplibregl from "maplibre-gl";

const earthRadius = 6371000; // meters

// Helper to generate a GeoJSON circle polygon from center and radius in meters
function createGeoJSONCircle(center: [number, number], radiusMeters: number, points = 64) {
    const coords: [number, number][] = [];
    const [lng, lat] = center;

    for (let i = 0; i < points; i++) {
        const angle = (i * 360) / points;
        const angleRad = (angle * Math.PI) / 180;

        const dx = radiusMeters * Math.cos(angleRad);
        const dy = radiusMeters * Math.sin(angleRad);

        const dLat = (dy / earthRadius) * (180 / Math.PI);
        const dLng = (dx / (earthRadius * Math.cos((lat * Math.PI) / 180))) * (180 / Math.PI);

        coords.push([lng + dLng, lat + dLat]);
    }

    coords.push(coords[0]); // close polygon

    return {
        type: "Feature",
        properties: {},
        geometry: {
            type: "Polygon",
            coordinates: [coords],
        },
    };
}

export class LocationItem extends TimelineItem {
    mapContainer: HTMLDivElement | null = null;

    renderCompact() {
        const loc = locations[this.details.locationId];
        return <h5 class="timeline-item location">{loc?.title ?? "Unknown Location"}</h5>;
    }

    renderCreateNew(props: { startTime: number; duration?: number; onChange: (field: string, value: any) => void }) {
        return (
            <>
                <div class="field border label max">
                    <select
                        value={this.details.locationId ?? ""}
                        onChange={(e) => props.onChange("locationId", e.currentTarget.value)}
                    >
                        <option value="" disabled>Select a location</option>
                        {Object.values(locations).map((loc) => (
                            <option value={loc.id}>{loc.title}</option>
                        ))}
                    </select>
                    <label> Select Location</label>
                </div>

                <div class="field border label max">
                    <input
                        type="number"
                        min={0}
                        value={props.startTime ?? ""}
                        onInput={(e) => props.onChange("startTime", Number(e.currentTarget.value))}
                    />
                    <label> Start Time (seconds)</label>
                </div>

                <div class="field border label max">
                    <input
                        type="number"
                        min={0}
                        value={props.duration ?? ""}
                        onInput={(e) => props.onChange("duration", Number(e.currentTarget.value))}
                    />
                    <label> Duration (seconds)</label>
                </div>
            </>
        );
    }

    renderFull() {
        const loc = locations[this.details.locationId];
        if (!loc) return "Unknown Location";

        const lat = loc.details?.lat ?? 0;
        const lng = loc.details?.lng ?? 0;
        const radius = loc.details?.radius ?? 100; // meters

        return (
            <div class="timeline-item location padding">
                <h2>{loc.title}</h2>
                <div>Lat: {lat}, Lng: {lng}, Radius: {radius} m</div>
                <div
                    class="padding"
                    style={{ width: "100%", height: "10em" }}
                    ref={(el) => {
                        if (!el) return;
                        this.mapContainer = el;

                        if (!this.mapContainer?.dataset.mapInit) {
                            const map = new maplibregl.Map({
                                container: el,
                                style: {
                                    version: 8,
                                    sources: {
                                        osm: {
                                            type: "raster",
                                            tiles: [
                                                "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            ],
                                            tileSize: 256,
                                        },
                                    },
                                    layers: [
                                        {
                                            id: "osm",
                                            type: "raster",
                                            source: "osm",
                                            minzoom: 0,
                                            maxzoom: 19,
                                        },
                                    ],
                                },
                                center: [lng, lat],
                                zoom: 14,
                            });

                            // Add marker
                            new maplibregl.Marker().setLngLat([lng, lat]).addTo(map);

                            map.on("load", () => {
                                map.addSource("circle", {
                                    type: "geojson",
                                    data: {
                                        type: "FeatureCollection",
                                        features: [
                                            createGeoJSONCircle([lng, lat], radius) as any
                                        ],
                                    },
                                });

                                map.addLayer({
                                    id: "radius-circle",
                                    type: "fill",
                                    source: "circle",
                                    paint: {
                                        "fill-color": "hsla(334, 100.00%, 50.00%, 0.1)",
                                        "fill-outline-color": "hsla(334, 100.00%, 50.00%, 0.8)",
                                    },
                                });
                            });

                            this.mapContainer.dataset.mapInit = "true";
                        }
                    }}
                ></div>
            </div>
        );
    }
}
