import { createSignal, For, onCleanup } from "solid-js";

export default function DragDropList() {
    const [items, setItems] = createSignal([
        "🍎 Apple",
        "🍌 Banana",
        "🍊 Orange",
        "🍇 Grapes",
    ]);

    const [draggingIndex, setDraggingIndex] = createSignal<number | null>(null);
    const [overIndex, setOverIndex] = createSignal<number | null>(null);

    function startDrag(index: number, e: PointerEvent) {
        setDraggingIndex(index);
        (e.target as HTMLElement).setPointerCapture(e.pointerId);

        function move(ev: PointerEvent) {
            const target = document.elementFromPoint(ev.clientX, ev.clientY);
            const li = target?.closest("li[data-index]") as HTMLElement | null;
            if (li) {
                setOverIndex(parseInt(li.dataset.index!));
            }
        }

        function end(ev: PointerEvent) {
            (e.target as HTMLElement).releasePointerCapture(e.pointerId);
            document.removeEventListener("pointermove", move);
            document.removeEventListener("pointerup", end);

            const src = draggingIndex();
            const dest = overIndex();
            if (src != null && dest != null && src !== dest) {
                const list = [...items()];
                const [moved] = list.splice(src, 1);
                list.splice(dest, 0, moved);
                setItems(list);
            }
            setDraggingIndex(null);
            setOverIndex(null);
        }

        document.addEventListener("pointermove", move);
        document.addEventListener("pointerup", end);
    }

    return (
        <ul style={{ "list-style": "none", padding: 0, margin: 0 }}>
            <For each={items()}>
                {(item, index) => (
                    <li
                        data-index={index()}
                        onPointerDown={(e) => startDrag(index(), e)}
                        style={{
                            padding: "0.5rem 1rem",
                            margin: "0.25rem 0",
                            border: "1px solid #ccc",
                            "border-radius": "6px",
                            "background-color":
                                draggingIndex() === index() ? "#fff3cd" :
                                    overIndex() === index() ? "#e8f0ff" : "#f9f9f9",
                            cursor: "grab",
                            "user-select": "none",
                        }}
                    >
                        {item}
                    </li>
                )}
            </For>
        </ul>
    );
}
