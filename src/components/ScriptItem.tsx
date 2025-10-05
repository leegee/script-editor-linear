import { JSX } from "solid-js/jsx-runtime";
import { Dynamic } from "solid-js/web";

export type Override<T, U> = Omit<T, keyof U> & U;

// Base props type
export interface ItemPropsType {
    type?: string;
    class?: string;
    icon?: string;
    name?: string;
    as?: string;
    children?: JSX.Element[] | string | undefined;
}

// Base class
export class ScriptItem<T extends ItemPropsType = ItemPropsType> {
    // Instance fields with defaults
    type: string = "item";
    class: string = "item";
    icon: string = "radio_button_unchecked";
    name: string = "item";
    as: string = "h6";

    constructor(props: Partial<T> = {}) {
        Object.assign(this, props); // override defaults with constructor props
    }

    /** Shared render logic */
    render(children?: JSX.Element[] | string | undefined) {
        return (
            <Dynamic component={this.as} class={this.class}>
                <article>
                    <summary>
                        <i>{this.icon}</i> <span>{this.name}</span>
                    </summary>
                    <details>{children}</details>
                </article>
            </Dynamic>
        );
    }
}

export default function Component<T extends ItemPropsType>(props: T) {
    const item = new ScriptItem<T>(props);
    return item.render(props.children);
}
