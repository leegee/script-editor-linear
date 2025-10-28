import { downloadJSON, initNewScript, loadJSONfromPath } from "../../lib/io";
import { showConfirm } from "../../stores/modals";
import JSONUploader from "../JsonUploader";

export default function FieMenuView() {
    return (
        <article>
            <header>
                <h2>File</h2>
            </header>
            <ul class="list border no-space">
                <li>
                    <i>add_notes</i>
                    <button
                        class="transparent no-padding"
                        onClick={async () => {
                            if (await showConfirm("This will over-write your script."))
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

                <hr class="space surface" />

                <li>
                    <i>book</i>
                    <button
                        class="transparent no-padding"
                        onClick={async () => {
                            if (await showConfirm("This will over-write your script."))
                                await loadJSONfromPath('/the-three-bears.json');
                        }}
                    >
                        Load sample script
                    </button>
                </li>
                <li>
                    <i>article</i>
                    <button
                        class="transparent no-padding"
                        onClick={async () => {
                            if (await showConfirm("This will over-write your script."))
                                await loadJSONfromPath('/the-three-bears-small.json');
                        }}
                    >
                        Load small sample script
                    </button>
                </li>
            </ul>
        </article>
    );
}
