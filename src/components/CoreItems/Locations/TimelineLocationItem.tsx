import "ol/ol.css";
import { createSignal, For, type JSX } from "solid-js";
import { A } from "@solidjs/router";
import { locations, addLocation } from "../../../stores";
import { TimelineItem, TimelineItemProps } from "../TimelineItem";
import { LocationRenderMixin } from "./LocationRenderMixin";
import { CanonicalLocation } from "./CanonicalLocation";
import { childRoute } from "../../../lib/routeResolver";

export type TimelineLocationItemType = InstanceType<typeof TimelineLocationItem>;

class BaseTimelineLocationItem extends TimelineItem {
    /**
     * Safely reconstructs a TimelineLocationItem from serialized data.
     * Preserves coordinate details if they exist.
     */
    static revive(obj: any): TimelineLocationItemType {
        const details =
            obj.details && typeof obj.details === "object"
                ? obj.details
                : { ref: obj.id };

        return new TimelineLocationItem({
            ...obj,
            details,
        });
    }

    static ListAllLocations() {
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

    constructor(props: Omit<TimelineItemProps, "type">) {
        const ref = props.details?.ref ?? props.id;
        const canonical = locations[ref];

        super({
            ...props,
            id: props.id || crypto.randomUUID(),
            type: "location",
            title: props.title ?? canonical?.title ?? "Untitled Location",
            details: { ref, ...props.details },
        });
    }


    renderCreateNew(props: { duration?: number; onChange: (field: string, value: any) => void }) {
        const [mode, setMode] = createSignal<"select" | "new">("select");

        return (
            <>
                <div class="field border middle-align max">
                    <label class="switch icon">
                        <input
                            type="checkbox"
                            checked={mode() === "new"}
                            onChange={(e) =>
                                setMode(e.currentTarget.checked ? "new" : "select")
                            }
                        />
                        <span>
                            <i>add_location</i>
                        </span>
                    </label>
                    <span class="left-padding">
                        {mode() === "new"
                            ? "Create a new location"
                            : "Select a location"}
                    </span>
                </div>

                {mode() === "new" && (
                    <>
                        <div class="field border label max">
                            <input
                                type="text"
                                placeholder="Title"
                                onInput={(e) =>
                                    props.onChange("title", e.currentTarget.value)
                                }
                            />
                            <label>Title</label>
                        </div>
                        <div class="field border label max">
                            <input
                                type="number"
                                placeholder="Latitude"
                                onInput={(e) =>
                                    props.onChange(
                                        "lat",
                                        parseFloat(e.currentTarget.value)
                                    )
                                }
                            />
                            <label>Latitude</label>
                        </div>
                        <div class="field border label max">
                            <input
                                type="number"
                                placeholder="Longitude"
                                onInput={(e) =>
                                    props.onChange(
                                        "lng",
                                        parseFloat(e.currentTarget.value)
                                    )
                                }
                            />
                            <label>Longitude</label>
                        </div>
                        <div class="field border label max">
                            <input
                                type="number"
                                placeholder="Radius (metres)"
                                onInput={(e) =>
                                    props.onChange(
                                        "radius",
                                        parseFloat(e.currentTarget.value)
                                    )
                                }
                            />
                            <label>Radius</label>
                        </div>
                    </>
                )}

                {mode() === "select" && (
                    <div class="field border label max">
                        <select
                            value={this.details.ref ?? ""}
                            onChange={(e) => props.onChange("ref", e.currentTarget.value)}
                        >
                            <option value="" disabled>
                                Select a Location
                            </option>
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
            const newCanonical = new CanonicalLocation({
                title: fields.title ?? "Untitled Location",
                details: {
                    lat: fields.lat ?? 0,
                    lng: fields.lng ?? 0,
                    radius: fields.radius ?? 100,
                },
            });
            addLocation(newCanonical);
            ref = newCanonical.id;
        }

        return {
            type: "location",
            title: fields.title,
            duration: fields.duration,
            details: { ref },
        };
    }

    timelineContent(zoom: number): JSX.Element | string | undefined {
        return this.title;
    }

}

export const TimelineLocationItem = LocationRenderMixin(BaseTimelineLocationItem);
