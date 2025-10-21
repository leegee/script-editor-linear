import { downloadJSON } from "../../lib/io";

export default function SettingsView() {
    return <article>
        <h2>Controls</h2>
        <ul class="list border no-space">
            <li >
                New script
            </li>
            <li>
                Load script
            </li>
            <li onclick={downloadJSON}>
                Save script
            </li>
        </ul>
    </article>;
}
