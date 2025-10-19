import { createSignal } from "solid-js";
import styles from "./DragHandleWithMenu.module.scss";

interface DragHandleWithMenuProps {
    class: string;
    onPointerDown: (e: PointerEvent) => void;
    onDuplicate?: () => void;
    onInsertBefore?: () => void;
    onInsertAfter?: () => void;
    onDelete?: () => void;
}

export default function DragHandleWithMenu(props: DragHandleWithMenuProps) {
    const [menuOpen, setMenuOpen] = createSignal(false);

    return (
        <div class={styles.component + " " + props.class}>
            <button class="transparent no-margin no-padding"
                onPointerDown={props.onPointerDown}
                style={{ cursor: 'grab' }}
            >
                <span>⠿</span>
            </button>

            {/* Overflow menu button */}
            <button class="transparent no-padding left-margin small-margin " onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen()); }}>
                <span>⋮</span>

                {menuOpen() && (
                    <menu class="overflow-menu border surface-bright secondary elevate" style={{ 'min-width': '120px', }} >
                        {props.onDuplicate && <li onClick={props.onDuplicate}>Duplicate</li>}
                        {props.onInsertBefore && <li onClick={props.onInsertBefore}>Insert Before</li>}
                        {props.onInsertAfter && <li onClick={props.onInsertAfter}>Insert After</li>}
                        {props.onDelete && <li onClick={props.onDelete}>Delete</li>}
                    </menu>
                )}
            </button>
        </div >

    );
}
