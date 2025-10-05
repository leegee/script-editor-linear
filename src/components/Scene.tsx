import { JSX } from "solid-js/jsx-runtime";
import { Dynamic } from "solid-js/web";

export interface ItemPropsType {
    type?: string;
    class?: string;
    icon?: string;
    name?: string;
    as?: string;
    children?: JSX.Element[] | string | undefined;
}

export class ScriptItem<T extends ItemPropsType = ItemPropsType> {
    type = "item";
    class = "item";
    icon = "radio_button_unchecked";
    name = "item";
    as = "h6";

    constructor(props: Partial<T> = {}) {
        Object.assign(this, props);
    }

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
