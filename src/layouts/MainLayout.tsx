import { ParentProps } from "solid-js";
import AlertConfirm from "../components/modals/AlertConfirm";
import { A } from "@solidjs/router";
import { FileMenuItms } from "../components/panels/FileMenuView";

export default function MainLayout(props: ParentProps) {
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
                                <A href='/menu/file'> File </A>
                                <menu class="no-wrap">
                                    <FileMenuItms />
                                </menu>
                            </li>
                            <li>Item 2</li>
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
