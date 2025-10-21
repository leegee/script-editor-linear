import { downloadJSON } from "../../lib/io";
import JSONUploader from "../JsonUploader";

export default function SettingsView() {
    return <article>
        <h2>File</h2>
        <ul class="list border no-space">
            <li>
                <i>article</i>
                <button class='transparent no-padding'>New script</button>
            </li>
            <li>
                <i>upload</i>
                <JSONUploader />
            </li>
            <li>
                <i>download</i>
                <button class='transparent no-padding' onclick={downloadJSON}>Save script</button>
            </li>
        </ul>
    </article>;
}
