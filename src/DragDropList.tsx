import { JSX, createSignal, For } from "solid-js";
import "./DragDropList.scss";

interface DragDropListProps {
  children: JSX.Element[];
}

export default function DragDropList(props: DragDropListProps) {
  // Order of children by index
  const [order, setOrder] = createSignal<number[]>(
    props.children.map((_, i) => i)
  );

  // Dragging state
  const [draggingIndex, setDraggingIndex] = createSignal<number | null>(null);
  const [overIndex, setOverIndex] = createSignal<number | null>(null);
  const [dragX, setDragX] = createSignal<number | null>(null);
  const [dragY, setDragY] = createSignal<number | null>(null);
  const [floatingWidth, setFloatingWidth] = createSignal(0);

  let floatingRef: HTMLDivElement | undefined;

  function startDrag(index: number, e: PointerEvent) {
    setDraggingIndex(index);
    setOverIndex(index);
    setDragX(e.clientX);
    setDragY(e.clientY);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    requestAnimationFrame(() => {
      if (floatingRef) setFloatingWidth(floatingRef.offsetWidth);
    });

    function move(ev: PointerEvent) {
      setDragX(ev.clientX);
      setDragY(ev.clientY);

      if (!floatingRef) return;

      // Temporarily hide floating element so it doesn't block elementFromPoint
      floatingRef.style.display = "none";
      const target = document.elementFromPoint(ev.clientX, ev.clientY);
      floatingRef.style.display = "";

      const li = target?.closest("li[data-index]") as HTMLElement | null;
      if (li) setOverIndex(Number(li.dataset.index));
    }

    function end() {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", end);

      const src = draggingIndex();
      const dest = overIndex();

      if (src !== null && dest !== null && src !== dest) {
        const newOrder = [...order()];
        const [moved] = newOrder.splice(src, 1);
        newOrder.splice(dest, 0, moved);
        setOrder(newOrder);
      }

      setDraggingIndex(null);
      setOverIndex(null);
      setDragX(null);
      setDragY(null);
      setFloatingWidth(0);
    }

    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", end);
  }

  return (
    <div class="drag-list">
      <ul>
        <For each={order()}>
          {(childIdx, idx) => {
            const index = idx(); // call accessor to get number
            const isDragging = draggingIndex() === index;
            const isPlaceholder = overIndex() === index && draggingIndex() !== null;

            return (
              <li
                data-index={index}
                onPointerDown={(e) => startDrag(index, e)}
                class={`${isDragging ? "dragging" : ""} ${isPlaceholder ? "placeholder" : ""
                  }`}
              >
                {props.children[childIdx]}
              </li>
            );
          }}
        </For>
      </ul>

      {draggingIndex() !== null &&
        dragX() !== null &&
        dragY() !== null && (
          <div
            class="floating"
            ref={floatingRef}
            style={{
              top: `${dragY()! - 24}px`,
              left: `${dragX()! - floatingWidth() / 2}px`,
            }}
          >
            {props.children[order()[draggingIndex()!]]}
          </div>
        )}
    </div>
  );
}
