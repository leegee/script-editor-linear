import { createSignal } from "solid-js";
import { downloadJSON, initNewScript, loadSampleScript } from "../../lib/io";
import { showConfirm } from "../../stores/modals";
import JSONUploader from "../JsonUploader";

export default function SettingsView() {
    const [activeTab, setActiveTab] = createSignal("file");

    return (
        <article>
            <nav class="tabbed small medium-margin margin-bottom">
                <a
                    class={activeTab() === "file" ? "active" : ""}
                    onClick={() => setActiveTab("file")}
                >
                    <i>description</i>
                    <span>File</span>
                </a>
                <a
                    class={activeTab() === "options" ? "active" : ""}
                    onClick={() => setActiveTab("options")}
                >
                    <i>settings</i>
                    <span>Options</span>
                </a>
                <a
                    class={activeTab() === "help" ? "active" : ""}
                    onClick={() => setActiveTab("help")}
                >
                    <i>help</i>
                    <span>Help</span>
                </a>
            </nav>

            <div class={`page padding ${activeTab() === "file" ? "active" : ""}`}>
                <ul class="list border no-space">
                    <li>
                        <i>article</i>
                        <button
                            class="transparent no-padding"
                            onClick={async () => {
                                if (await showConfirm("This will over-write your script - OK?"))
                                    initNewScript();
                            }}
                        >
                            New script
                        </button>
                    </li>
                    <li>
                        <i>upload</i>
                        <JSONUploader />
                    </li>
                    <li>
                        <i>download</i>
                        <button
                            class="transparent no-padding"
                            onClick={downloadJSON}
                        >
                            Save script
                        </button>
                    </li>
                    <hr />
                    <li>
                        <i>book</i>
                        <button
                            class="transparent no-padding"
                            onClick={async () => {
                                if (await showConfirm("This will over-write your script - OK?"))
                                    loadSampleScript();
                            }}
                        >
                            Load sample script
                        </button>
                    </li>
                </ul>
            </div>

            <div class={`page padding ${activeTab() === "options" ? "active" : ""}`}>
                <p>Options go here…</p>
            </div>

            <div class={`page padding ${activeTab() === "help" ? "active" : ""}`}>
                <p>Help information here…</p>
            </div>
        </article>
    );
}
