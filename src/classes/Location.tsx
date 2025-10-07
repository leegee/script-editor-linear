import { JSX } from "solid-js/jsx-runtime";
import { BaseItem, type BaseItemProps } from "./BaseItem";

export type LocationPropsType = BaseItemProps<'location'> & {
    lat: number;
    lng: number;
    polyline?: string;
    radius?: number;
}

export class Location extends BaseItem<LocationPropsType> {
    render(): JSX.Element {
        return <div class={'border max fill padding card ' + this.props.type}>
            Location
        </div>;
    }
}
