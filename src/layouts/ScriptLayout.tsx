import { type ParentProps } from "solid-js";
import ScriptView from "../components/views/ScriptView";

export default function ScriptLayout(props: ParentProps) {
    return (
        <>
            <main class="responsive" style="overflow:hidden; height: 100vh">
                <div class="grid" style="height: calc(100vh - 7em); overflow: hidden ">
                    <div class="surface-container-low s12 m8 l8" style='height: auto; overflow-y: auto'>
                        <ScriptView />
                    </div>

                    <div class="surface-container-low s12 m4 l4 small-padding right-padding left-padding" style="height:100%; overflow:hidden;   display: flex; flex-direction: column;">
                        <fieldset class="surface-container top-padding">
                            {props.children}
                        </fieldset>
                    </div>
                </div>
            </main>
        </>
    );
}
