import { ParentProps } from "solid-js";
import AlertConfirm from "../components/modals/AlertConfirm";
import { A, useNavigate } from "@solidjs/router";
import { childRoute } from "../lib/routeResolver";
import { ConfirmLink } from "../components/ConfirmLink";
import JSONUploader from "../components/JsonUploader";
import { initNewScript, downloadJSON, loadJSONfromPath } from "../lib/io";

export default function MainLayout(props: ParentProps) {
    const navigate = useNavigate();
    let menuRef: HTMLMenuElement | undefined;

    function closeMenu(e: MouseEvent) {
        if (menuRef && menuRef.contains(e.target as HTMLElement)) menuRef.classList.remove("active");
    };

    return (
        <>
            <AlertConfirm />

            <main style="height: 100vh">
                <div class="tabs max">
                    <button class="transparent">
                        <i>more_vert</i>
                        <menu ref={(el) => menuRef = el} style="z-index:999" onClick={closeMenu}>
                            <li>
                                File
                                <menu class="no-wrap">
                                    <FileMenuItems />
                                </menu>
                            </li>
                            <li>View
                                <menu class="no-wrap">
                                    <ViewMenuItems />
                                </menu>
                            </li>
                            <li>Item 3</li>
                        </menu>
                    </button>
                    <A title="Script view" class="transparent" href="/script"><i class="small">list_alt</i></A>
                    <A title="Timeline view" class="transparent" href="/timeline"><i class="small">view_timeline</i></A>
                    <A title="View settings" class="transparent" href="/settings"><i class="small">settings</i></A>
                </div>

                <div>
                    <div class="page active">
                        {props.children}
                    </div>
                </div>
            </main>
        </>
    );
}

function ViewMenuItems() {
    const navigate = useNavigate()
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

