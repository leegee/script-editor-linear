import { JSX } from "solid-js";
import { LocationMap } from "./LocationMap";
import MapLinks from "./MapLinks";
import TimelineItemEditor from "../../ItemEditor";
import { locations } from "../../../stores";

type Constructor<T = {}> = new (...args: any[]) => T;

export function LocationRenderMixin<TBase extends Constructor>(Base: TBase) {
    return class extends Base {
        /**
         * Renders compact view: simple title
         */
        renderCompact(): JSX.Element {
            const title = (this as any).title ?? "Unknown Location";
            return <h4 class="timeline-item location">{title}</h4>;
        }

        /**
         * Renders full view: includes table, map, and optionally TimelineItemEditor if this is a timeline item
         */
        renderFull(): JSX.Element {
            const obj: any = this;
            const details = obj.details ?? { lat: 0, lng: 0, radius: 0 };
            const { lat, lng, radius } = details;
            const title = obj.title ?? "Unknown Location";

            // Determine if this is a TimelineLocationItem by checking if it has a 'details.ref'
            const isTimelineItem = "ref" in details && typeof details.ref === "string";
            const canonical = isTimelineItem ? locations[details.ref] ?? details : details;

            return (
                <article class="border padding">
                    <h3 class="field">
                        {isTimelineItem ? (
                            <TimelineItemEditor
                                store="locations"
                                id={canonical.id}
                                path="title"
                                defaultValue={canonical.title ?? title}
                            />
                        ) : (
                            <span>{title}</span>
                        )}
                    </h3>

                    <table class="bottom-margin">
                        <tbody>
                            <tr><th>Latitude</th><td>{canonical.details?.lat ?? lat}</td></tr>
                            <tr><th>Longitude</th><td>{canonical.details?.lng ?? lng}</td></tr>
                            <tr><th>Radius</th><td>{canonical.details?.radius ?? radius}</td></tr>
                        </tbody>
                    </table>

                    <LocationMap
                        lat={canonical.details?.lat ?? lat}
                        lng={canonical.details?.lng ?? lng}
                        radius={canonical.details?.radius ?? radius}
                        onChange={() => { }} // optionally override in timeline items
                    />

                    <div class="top-margin large-margin">
                        <MapLinks
                            lat={canonical.details?.lat ?? lat}
                            lng={canonical.details?.lng ?? lng}
                        />
                    </div>
                </article>
            );
        }
    };
}
