import "ol/ol.css";
import { onMount } from "solid-js";
import Map from "ol/Map";
import View from "ol/View";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM } from "ol/source";
import VectorSource from "ol/source/Vector";
import { fromLonLat, toLonLat } from "ol/proj";
import { Collection, Feature } from "ol";
import Point from "ol/geom/Point";
import Circle from "ol/geom/Circle";
import { Style, Fill, Stroke, Icon } from "ol/style";
import Translate from "ol/interaction/Translate";
import Modify from "ol/interaction/Modify";
import FullScreen from "ol/control/Fullscreen";

type LocationMapProps = {
    lat: number;
    lng: number;
    radius: number;
    onChange?: (lat: number, lng: number, radius: number, text?: string) => void;
    class?: string;
    height?: string;
};

export function LocationMap(props: LocationMapProps) {
    let container: HTMLDivElement | undefined;
    let map: Map | null = null;
    let marker: Feature<Point>;
    let circleFeature: Feature<Circle>;

    onMount(() => {
        if (!container) return;

        const center = fromLonLat([props.lng, props.lat]);

        marker = new Feature({ geometry: new Point(center) });
        marker.setStyle(
            new Style({
                image: new Icon({
                    src: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
                    scale: 0.04,
                    anchor: [0.5, 1],
                }),
            })
        );

        circleFeature = new Feature({ geometry: new Circle(center, props.radius) });
        circleFeature.setStyle(
            new Style({
                stroke: new Stroke({ color: "rgba(239, 68, 68, 0.8)", width: 2 }),
                fill: new Fill({ color: "rgba(239, 68, 68, 0.25)" }),
            })
        );

        const vectorLayer = new VectorLayer({
            source: new VectorSource({ features: [marker, circleFeature] }),
        });

        map = new Map({
            target: container!,
            layers: [new TileLayer({ source: new OSM() }), vectorLayer],
            view: new View({ center, zoom: 14 }),
            controls: [
                new FullScreen({ tipLabel: "Expand map" })
            ],
        });

        const translate = new Translate({ features: new Collection([marker]) });
        map.addInteraction(translate);
        translate.on("translateend", () => {
            const coord = marker.getGeometry()!.getCoordinates();
            const [lng, lat] = toLonLat(coord);
            const radius = circleFeature.getGeometry()!.getRadius();
            circleFeature.setGeometry(new Circle(coord, radius)); // move circle center
            props.onChange?.(lat, lng, radius);
        });

        const modify = new Modify({ features: new Collection([circleFeature]) });
        map.addInteraction(modify);
        modify.on("modifyend", () => {
            const geom = circleFeature.getGeometry();
            if (!geom) return;
            const coord = geom.getCenter();
            const radius = geom.getRadius();
            const [lng, lat] = toLonLat(coord);
            props.onChange?.(lat, lng, radius);
        });
    });

    return (
        <div
            ref={el => (container = el!)}
            class={props.class}
            style={{ width: "100%", height: props.height ?? "15em" }}
        />
    );
}
