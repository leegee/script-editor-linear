import { createSignal, For, JSX, Show } from "solid-js";
import { locations, updateLocation } from "../../../stores";
import { LocationMap } from "./LocationMap";
import MapLinks from "./MapLinks";
import TimelineItemEditor from "../../TimelineItemEditor";
import { TimelineItemProps, type TimelineItem } from "../TimelineItem";
import { useChildRoute } from "../../ChildRoute";
import { A } from "@solidjs/router";

type Constructor<T = {}> = new (...args: any[]) => T;

export function LocationRenderMixin<TBase extends Constructor<TimelineItem>>(Base: TBase) {

    return class extends Base {
        _icon = "location_on";

        static ListAllLocations() {
            const { childRoute } = useChildRoute();

            return (
                <ul class="responsive no-space list scroll surface border">
                    <For each={Object.values(locations)}>
                        {(loc) => (
                            <li>
                                <A href={childRoute(`locations/${loc.id}`)}>{loc.title}</A>
                            </li>
                        )}
                    </For>
                </ul>
            );
        }

        renderCompact(): JSX.Element {
            const title = (this as any).title ?? "Unknown Location";
            // {/* {title}
            // {(this as unknown as TimelineItem).compactTagList()} */}
            return (
                <h4 style="opacity:80%" class="with-tag" >
                    <div>
                        <code>{this.type.toLocaleUpperCase()}</code>
                        {" "}
                        <Show when={this.title || this.details.text}>
                            &mdash; {" "}
                        </Show>
                        {this.title || this.details.text || ""}
                    </div>
                    <div class="row right">
                        {this.compactNoteList()}
                        {this.compactTagList()}
                    </div>
                </h4>
            );
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
                <>
                    <header class="no-padding">
                        <nav class="no-space">
                            <h3 class="max" style="text-transform:capitalize">
                                {isTimelineItem && canonicalId ? (
                                    <TimelineItemEditor
                                        store="locations"
                                        path="title"
                                        id={canonicalId}
                                    />
                                ) : (
                                    <span>{canonicalTitle}</span>
                                )}
                            </h3>

                            <a>
                                <i>{this.icon}</i>
                            </a>
                        </nav>
                    </header>

                    <TimelineItemEditor
                        store="locations"
                        id={canonicalId}
                        path="details"
                        key="text"
                        label="Description"
                        multiline
                    />

                    <LocationMap
                        lat={canonicalDetails.lat}
                        lng={canonicalDetails.lng}
                        radius={canonicalDetails.radius}
                        onChange={(newLat: number, newLng: number, newRadius: number, text?: string) => {
                            if (canonicalId) {
                                updateLocation(canonicalId, {
                                    details: { lat: newLat, lng: newLng, radius: newRadius }
                                });
                            }
                        }}
                    />

                    <div class="top-margin large-margin">
                        <MapLinks
                            lat={canonicalDetails.lat}
                            lng={canonicalDetails.lng}
                        />
                    </div>

                    {this.panelTagsSection()}

                    {this.panelNotesSection()}

                </>
            );
        }
    };
}
