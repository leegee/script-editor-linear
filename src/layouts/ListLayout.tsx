import { type ParentProps } from "solid-js";
import DragDropList from "../components/DragDropList";

export default function ListLayout(props: ParentProps) {
    return (
        <>
            <main class="responsive"
                style="overflow:hidden; height: 100vh"
            >
                <div class="grid"
                    style="height: calc(100vh - 7em); overflow: hidden"
                >
                    <div class="surface-container-low s12 m8 l8"
                        style='height: auto; overflow-y: auto'
                    >
                        <DragDropList />
                    </div>

                    <div class="surface-container-low s12 m4 l4 small-padding right-padding left-padding"
                        style="overflow-y: auto; height:100%; display:flex; flex-direction: column"
                    >
                        <fieldset class="surface-container top-padding"
                            style="overflow-y:auto; overflow-x: hidden"
                        >
                            {props.children}
                        </fieldset>
                    </div>
                </div>
            </main>
        </>
    );
}
