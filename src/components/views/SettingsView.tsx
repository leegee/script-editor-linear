import { downloadJSON, initNewScript, loadSampleScript } from "../../lib/io";
import { showConfirm } from "../../stores/modals";
import JSONUploader from "../JsonUploader";

export default function SettingsView() {
    return <article>
        <h2>File</h2>
        <ul class="list border no-space">
            <li>
                <i>article</i>
                <button class='transparent no-padding' onClick={
                    async () => { if (await showConfirm("This will over-write your script - OK?")) initNewScript() }
                }>New script</button>
            </li>
            <li>
                <i>upload</i>
                <JSONUploader />
            </li>
            <li>
                <i>download</i>
                <button class='transparent no-padding' onclick={downloadJSON}>Save script</button>
            </li>
            <hr />
            <li>
                <i>book</i>
                <button class='transparent no-padding' onclick={
                    async () => { if (await showConfirm("This will over-write your script - OK?")) loadSampleScript() }
                } >Load sample script</button>
            </li>
        </ul>
    </article>;
}


