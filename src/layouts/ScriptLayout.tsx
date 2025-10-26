import { type ParentProps } from "solid-js";
import ScriptView from "../components/views/ScriptView";

export default function ScriptLayout(props: ParentProps) {
    return (
        <main class="app responsive">

            <div class="grid" style="height: calc(100vh - 7em); overflow: hidden ">
                <div class="s12 m8 l8" style='height: auto; overflow-y: auto'>
                    <ScriptView />
                </div>

                <div class="s12 m4 l4" >
                    {props.children}
                </div>
            </div>
        </main>
    );
}
