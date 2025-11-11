import { A, useNavigate } from "@solidjs/router";
import { ConfirmLink } from "../components/ConfirmLink";
import JSONUploader from "../components/JsonUploader";
import { initNewScript, downloadJSON, loadJSONfromPath } from "../lib/io";
import { useChildRoute } from "../components/ChildRoute";

export function Menu() {
    const { childRoute } = useChildRoute();
    const navigate = useNavigate();
    let buttonRef: HTMLButtonElement | undefined;
    let menuRef: HTMLMenuElement | undefined;

    function closeMenu(e: MouseEvent) {
        window.ui('menu')
    };

    return (
        <button ref={(el) => buttonRef = el} class="transparent margin round">
            <i>more_vert</i>
            <menu style="z-index:999" onClick={closeMenu} ref={(el) => menuRef = el}>
                <li>
                    <i>folder_open</i>
                    File
                    <menu class="no-wrap">
                        <FileMenuItems />
                    </menu>
                </li>
                <li>
                    <i>view_quilt</i>
                    View
                    <menu class="no-wrap">
                        <ViewMenuItems />
                    </menu>
                </li>
                <li>
                    <i>settings</i>
                    <A href="#"
                        onClick={async (e) => {
                            e.preventDefault();
                            navigate('/settings');
                        }}
                    >
                        Settings
                    </A>
                </li>
            </menu>
        </button>
    );
}

function ViewMenuItems() {
    const navigate = useNavigate()
    const { childRoute } = useChildRoute();

    return (<>
        <li>
            <i>move_location</i>
            <A href="#"
                onClick={async (e) => {
                    e.preventDefault();
                    navigate(childRoute('locations'));
                }}
            >
                Locations
            </A>
        </li>
        <li>
            <i>people</i>
            <A href="# " onClick={(e) => {
                e.preventDefault();
                navigate(childRoute('characters'));
            }}>
                Characters
            </A>
        </li>
        <li>
            <i>filter_alt</i>
            <A href="# " onClick={(e) => {
                e.preventDefault();
                navigate(childRoute('filters'));
            }}>
                Filters
            </A>
        </li>
    </>)
}


function FileMenuItems() {
    const navigate = useNavigate();
    return (
        <>
            <li>
                <i>news</i>
                <ConfirmLink
                    href="/script/new"
                    message="This will over-write your script."
                    onConfirm={initNewScript}
                >
                    New script
                </ConfirmLink>
            </li>

            <li>
                <i>upload_file</i>
                <JSONUploader />
            </li>

            <li>
                <i>file_save</i>
                <A href="#"
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

