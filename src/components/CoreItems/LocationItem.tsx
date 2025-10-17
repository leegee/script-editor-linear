import { locations } from "../../stores";
import { TimelineItem } from "./TimelineItem";

export class LocationItem extends TimelineItem {
    renderCompact() {
        const loc = locations[this.details.locationId];
        return <h5 class="timeline-item location">{loc?.title ?? "Unknown Location"}</h5>;
    }

    renderFull() {
        const loc = locations[this.details.locationId];
        if (!loc) return "Unknown Location";
        return (
            <div class="timeline-item location">
                <strong>{loc.title}</strong>
                <div>Lat: {loc.details?.lat ?? "?"}, Lng: {loc.details?.lng ?? "?"}</div>
            </div>
        );
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
}
