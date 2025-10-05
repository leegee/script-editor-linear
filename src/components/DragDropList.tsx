import { JSX, createSignal, For } from "solid-js";
import "./DragDropList.scss";

interface DragDropListProps {
  children: JSX.Element[];
}

// Adds listeners on init, cleans up on exit
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

  let floatingRef: HTMLLIElement | undefined;

  function startDrag(index: number, e: PointerEvent) {
    setDraggingIndex(index);
    setOverIndex(index);
    setDragX(e.clientX);
    setDragY(e.clientY);
    (e.target as HTMLElement).classList.add('clicked');
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

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
      (e.target as HTMLElement).classList.remove('clicked');
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
    }

    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", end);
  }

  return (
    <div class="drag-list">
      <ul class="list border medium-space">
        <For each={order()}>
          {(childIdx, idx) => {
            const index = idx();
            const isDragging = draggingIndex() === index;
            const isPlaceholder = overIndex() === index && draggingIndex() !== null;

            return (
              <li
                data-index={index}
                onPointerDown={(e) => startDrag(index, e)}
                class={
                  `border fill tiny-margin tiny-padding  ${isDragging ? "dragging" : ""
                  } ${isPlaceholder ? "placeholder" : ""
                  } ${overIndex() === index ? "drag-over" : ""}`
                }
              >
                {props.children[childIdx]}
              </li>
            );
          }}
        </For>

        {draggingIndex() !== null &&
          dragX() !== null &&
          dragY() !== null && (
            <li
              class="floating large-elevate border tiny-margin tiny-padding secondary"
              ref={floatingRef}
              style={{
                top: `calc(${dragY()!}px - 4em)`,
              }}
            >
              {props.children[order()[draggingIndex()!]]}
            </li>
          )}

      </ul>

    </div>
  );
}
