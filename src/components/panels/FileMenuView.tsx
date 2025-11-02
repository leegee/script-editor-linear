import { downloadJSON, initNewScript, loadJSONfromPath } from "../../lib/io";
import JSONUploader from "../JsonUploader";
import { ConfirmLink } from "../ConfirmLink";
import { A, useNavigate } from "@solidjs/router";

export default function FileMenuView() {
    return (
        <article>
            <header>
                <h2>File</h2>
            </header>
            <ul class="list border no-space">
                <FileMenuItems />
            </ul>
        </article>
    );
}

export function FileMenuItems() {
    const navigate = useNavigate();
    return (
        <>
            <li>
                <i>add_notes</i>
                <ConfirmLink
                    href="/script/new"
                    message="This will over-write your script."
                    onConfirm={initNewScript}
                >
                    New script
                </ConfirmLink>
            </li>

            <li>
                <i>upload</i>
                <JSONUploader />
            </li>

            <li>
                <i>download</i>
                <A
                    href="#"
                    onClick={async (e) => {
                        e.preventDefault();
                        await downloadJSON();
                        navigate('/script');
                    }}
                >
                    Save script
                </A>
            </li>

            <hr class="space surface" />

            <li>
                <i>book</i>
                <ConfirmLink
                    href="/script/"
                    message="This will over-write your script."
                    onConfirm={async () => {
                        await loadJSONfromPath("/the-three-bears.json");
                        navigate('/script');
                    }}
                >
                    Load sample script
                </ConfirmLink>
            </li>

            <li>
                <i>article</i>
                <ConfirmLink
                    href="/script/"
                    message="This will over-write your script."
                    onConfirm={async () => {
                        await loadJSONfromPath("/the-three-bears-small.json");
                        navigate('/script');
                    }}
                >
                    Load small sample script
                </ConfirmLink>
            </li>
        </>
    );
}
