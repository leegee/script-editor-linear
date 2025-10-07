import { type JSX } from "solid-js/jsx-runtime";
import { createStore } from "solid-js/store";


export interface BaseItemProps<T extends string = 'base'> {
    type: T;
    id: string;
    text: string;
}

export class BaseItem<P extends BaseItemProps<string> = BaseItemProps> {
    props: P;

    constructor(data: P) {
        const [store] = createStore(data);
        this.props = store;
    }

    toJSON(): P {
        return { ...this.props };
    }

    render(): JSX.Element {
        return <div class={'border max fill padding ' + this.props.type}>{this.props.text}</div>;
    }
}
