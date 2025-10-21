import { downloadJSON } from "../../lib/io";
import JSONUploader from "../JsonUploader";

export default function SettingsView() {
    return <article>
        <h2>File</h2>
        <ul class="list border no-space">
            <li>
                <button class='transparent no-padding'>New script</button>
            </li>
            <li>
                <JSONUploader />
            </li>
            <li>
                <button class='transparent no-padding' onclick={downloadJSON}>Save script</button>
            </li>
        </ul>
    </article>;
}
