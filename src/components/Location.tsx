import { Dynamic } from "solid-js/web";
import type { JSX } from "solid-js/jsx-runtime";
import { ScriptItem, type ItemPropsType } from "./ScriptItem";

// Base props for a location item
type BaseLocationFields = ItemPropsType & {
    lat: number;
    lng: number;
};

// Either radius XOR polyline
export type LocationFieldsType =
    | (BaseLocationFields & { radius: number; polyline?: never })
    | (BaseLocationFields & { polyline: string; radius?: never });

// Subclass for Location
export class LocationItem extends ScriptItem<LocationFieldsType> {
    type: "location" = "location";
    class: string = "location";
    icon: string = "map";
    as: string = "h6";
    name: string = "location";

    // Location-specific fields
    lat!: number;
    lng!: number;
    radius?: number;
    polyline?: string;

    constructor(props: Partial<LocationFieldsType>) {
        super(props);

        // Ensure required fields exist
        if (props.lat !== undefined) this.lat = props.lat;
        if (props.lng !== undefined) this.lng = props.lng;

        if ("radius" in props) this.radius = props.radius;
        if ("polyline" in props) this.polyline = props.polyline;
    }

    override render(children?: JSX.Element[] | string) {
        return (
            <Dynamic component={this.as} class={this.class}>
                <article>
                    <summary>
                        <i>{this.icon}</i> <span>{this.name}</span>
                    </summary>
                    <details>
                        {children}
                        <div>
                            <strong>Lat:</strong> {this.lat}, <strong>Lng:</strong> {this.lng}
                        </div>
                        {this.radius !== undefined && <div>Radius: {this.radius}</div>}
                        {this.polyline && <div>Polyline: {this.polyline}</div>}
                    </details>
                </article>
            </Dynamic>
        );
    }
}

export function Location(props: LocationFieldsType) {
    const item = new LocationItem(props);
    return item.render(props.children);
}

export default Location;
