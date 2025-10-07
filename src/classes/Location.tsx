import { JSX } from "solid-js/jsx-runtime";
import { BaseScriptItem, type BaseScriptItemProps } from "./ScriptItem";

export type LocationPropsType = BaseScriptItemProps<'location'> & {
    lat: number;
    lng: number;
    polyline?: string;
    radius?: number;
}

export class Location extends BaseScriptItem<LocationPropsType> {
    render(): JSX.Element {
        return <div class={this.props.type}>
            this.props.text
        </div>;
    }

}
