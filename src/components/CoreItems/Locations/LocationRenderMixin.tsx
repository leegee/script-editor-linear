import { JSX } from "solid-js";
import { LocationMap } from "./LocationMap";
import MapLinks from "./MapLinks";
import TimelineItemEditor from "../../TimelineItemEditor";
import { locations } from "../../../stores";

type Constructor<T = {}> = new (...args: any[]) => T;

export function LocationRenderMixin<TBase extends Constructor>(Base: TBase) {
    return class extends Base {
        renderCompact(): JSX.Element {
            const title = (this as any).title ?? "Unknown Location";
            return <h4 class="timeline-item location">{title}</h4>;
        }

        renderFull(): JSX.Element {
            const obj: any = this;
            const details = obj.details ?? { lat: 0, lng: 0, radius: 0 };
            const { lat, lng, radius } = details;
            const title = obj.title ?? "Unknown Location";

            // Determine if this is a TimelineLocationItem by checking if it has a 'details.ref'
            const isTimelineItem = details && typeof details.ref === "string";

            // Either fetch canonical location or fall back to a safe stub
            const canonical = isTimelineItem
                ? locations[details.ref] || { id: details.ref, title: obj.title, details: { lat, lng, radius } }
                : { details };

            // Type guard: ensure canonical has id/title before accessing
            const hasCanonicalFields = (
                c: any
            ): c is { id: string; title: string; details: any } =>
                typeof c.id === "string" && typeof c.title === "string";

            const canonicalId = hasCanonicalFields(canonical) ? canonical.id : undefined;
            const canonicalTitle = hasCanonicalFields(canonical)
                ? canonical.title ?? title
                : title;
            const canonicalDetails = canonical.details ?? { lat, lng, radius };

            return (
                <article class="border padding">
                    <h3 class="field">
                        {isTimelineItem && canonicalId ? (
                            <TimelineItemEditor
                                store="locations"
                                id={canonicalId}
                                path="title"
                                defaultValue={canonicalTitle}
                            />
                        ) : (
                            <span>{canonicalTitle}</span>
                        )}
                    </h3>

                    <table class="bottom-margin">
                        <tbody>
                            <tr>
                                <th>Latitude</th>
                                <td>{canonicalDetails.lat}</td>
                            </tr>
                            <tr>
                                <th>Longitude</th>
                                <td>{canonicalDetails.lng}</td>
                            </tr>
                            <tr>
                                <th>Radius</th>
                                <td>{canonicalDetails.radius}</td>
                            </tr>
                        </tbody>
                    </table>

                    <LocationMap
                        lat={canonicalDetails.lat}
                        lng={canonicalDetails.lng}
                        radius={canonicalDetails.radius}
                        onChange={() => { }}
                    />

                    <div class="top-margin large-margin">
                        <MapLinks
                            lat={canonicalDetails.lat}
                            lng={canonicalDetails.lng}
                        />
                    </div>
                </article>
            );
        }
    };
}
