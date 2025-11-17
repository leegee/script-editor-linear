import { type ParentProps } from "solid-js";
import TypingInput from "../components/TypingInput";
import TimelineSidePanel from "../components/panels/TimelineSidePanel";

export default function ScriptLayout(props: ParentProps) {
    return (
        <main class="responsive" style="overflow:hidden; height: 100vh">
            <div>
                <TypingInput />
            </div>

            <TimelineSidePanel>
                {props.children}
            </TimelineSidePanel>
        </main>
    );
}
