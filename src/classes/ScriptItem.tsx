import { type JSX } from "solid-js/jsx-runtime";
import { createStore } from "solid-js/store";


export interface BaseScriptItemProps<T extends string = 'base'> {
    type: T;
    id: string;
    text: string;
}

export class BaseScriptItem<P extends BaseScriptItemProps<string> = BaseScriptItemProps> {
    props: P;

    constructor(data: P) {
        const [store] = createStore(data);
        this.props = store;
    }

    toJSON(): P {
        return { ...this.props };
    }

    render(): JSX.Element {
        return <div class={this.props.type}>{this.props.text}</div>;
    }
}
