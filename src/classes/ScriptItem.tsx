import { type JSX } from "solid-js/jsx-runtime";
import { createStore } from "solid-js/store";

export interface BaseScriptItemProps {
    id: string;
    type: string;
    time: number;
    text: string;
    [key: string]: any;
}

export class BaseScriptItem {
    props: BaseScriptItemProps;

    constructor(data: BaseScriptItemProps) {
        const [store] = createStore(data);
        this.props = store;
    }

    toJSON(): BaseScriptItemProps {
        return { ...this.props };
    }

    render(): JSX.Element {
        return <div class={this.props.type}>{this.props.text}</div>;
    }
}
