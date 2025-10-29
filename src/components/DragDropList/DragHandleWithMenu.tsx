import { createSignal } from "solid-js";
import styles from "./DragHandleWithMenu.module.scss";

interface DragHandleWithMenuProps {
    class: string;
    onPointerDown: (e: PointerEvent) => void;
    onAddNote?: () => void;
    onDuplicate?: () => void;
    onInsertBefore?: () => void;
    onInsertAfter?: () => void;
    onDelete?: () => void;
}

export default function DragHandleWithMenu(props: DragHandleWithMenuProps) {
    const [menuOpen, setMenuOpen] = createSignal(false);

    return (
        <div class={styles.component + " " + props.class}>
            <button class="transparent tiny-padding tiny-margin"
                onPointerDown={props.onPointerDown}
                style={{ cursor: 'grab' }}
            >
                <span>⠿</span>
            </button>

            {/* Overflow menu button */}
            <button class="transparent tiny-padding tiny-margin " onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen()); }}>
                <span>⋮</span>

                {menuOpen() && (
                    <menu class={"border surface-bright secondary elevate " + styles.menu}>
                        {props.onAddNote && <li onClick={props.onAddNote}>
                            <i>note_add</i> Add Note
                        </li>}
                        {props.onDuplicate && <li onClick={props.onDuplicate}>
                            <i>control_point_duplicate</i> Duplicate
                        </li>}
                        {props.onInsertBefore && <li onClick={props.onInsertBefore}>
                            <i>arrow_upward</i> New Before
                        </li>}
                        {props.onInsertAfter && <li onClick={props.onInsertAfter}>
                            <i>arrow_downward</i>  New After
                        </li>}
                        {props.onDelete && <li onClick={props.onDelete}>
                            <i>delete</i> Delete
                        </li>}
                    </menu>
                )}
            </button>
        </div>

    );
}
