import { ParentProps } from "solid-js";

export default function FieMenuView(props: ParentProps) {
    return (
        <main class="responsive">
            {props.children}
        </main>
    );
}
