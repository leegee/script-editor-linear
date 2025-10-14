import { JSX, createSignal, createEffect, For } from "solid-js";
import "./DragDropList.scss";

interface DragDropListProps<T = any> {
  items: T[];
  renderItem: (item: T, index: number) => JSX.Element | null;
  onReorder?: (newOrder: number[]) => void;
  className?: string;
}

export default function DragDropList<T>(props: DragDropListProps<T>) {
  const [order, setOrder] = createSignal(props.items.map((_, i) => i));
  const [draggingIndex, setDraggingIndex] = createSignal<number | null>(null);
  const [overIndex, setOverIndex] = createSignal<number | null>(null);
  const [dragX, setDragX] = createSignal<number | null>(null);
  const [dragY, setDragY] = createSignal<number | null>(null);
  let floatingRef: HTMLElement | undefined;

  let offsetX = 0;
  let offsetY = 0;

  createEffect(() => {
    console.log('#', props.items)
    const len = props.items.length;
    const cur = order();
    if (cur.length !== len) {
      const kept = cur.filter(i => i < len);
      const added = Array.from({ length: len }, (_, i) => i).filter(i => !kept.includes(i));
      setOrder([...kept, ...added]);
    }
  });

  function startDrag(index: number, startDragEvent: PointerEvent) {
    setDraggingIndex(index);
    setOverIndex(index);
    setDragX(startDragEvent.clientX);
    setDragY(startDragEvent.clientY);
    const targetEl = startDragEvent.target as HTMLElement;
    targetEl.classList.add("clicked");
    targetEl.setPointerCapture?.(startDragEvent.pointerId);
    const rect = targetEl.getBoundingClientRect();
    offsetX = startDragEvent.clientX - rect.left;
    offsetY = startDragEvent.clientY - rect.top;

    function move(moveEvent: PointerEvent) {
      setDragX(moveEvent.clientX);
      setDragY(moveEvent.clientY);
      if (!floatingRef) return;
      if (floatingRef) floatingRef.style.display = "none"; // Hide whilst measuring
      const target = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
      if (floatingRef) floatingRef.style.display = "";
      const el = target?.closest("[data-index]") as HTMLElement | null;
      if (el) setOverIndex(Number(el.dataset.index));
    }

    function end() {
      try {
        targetEl.classList.remove("clicked");
        targetEl.releasePointerCapture?.(startDragEvent.pointerId);
      } catch { }
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", end);

      const src = draggingIndex();
      const dest = overIndex();

      if (src !== null && dest !== null && src !== dest) {
        const next = [...order()];
        const [moved] = next.splice(src, 1);
        next.splice(dest, 0, moved);
        setOrder(next);
        props.onReorder?.(next);
      }

      setDraggingIndex(null);
      setOverIndex(null);
      setDragX(null);
      setDragY(null);
    }

    function cancelDrag(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setDraggingIndex(null);
        setOverIndex(null);
        setDragX(null);
        setDragY(null);
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", end);
        document.removeEventListener("keydown", cancelDrag);
      }
    }

    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", end);
    document.addEventListener("keydown", cancelDrag);
  }

  return (
    <div class={props.className ?? "drag-list"}>
      <ul class="list border no-space" style="position:relative">
        <For each={order()}>
          {(itemIdx, idx) => {
            const pos = idx();
            const isDragging = draggingIndex() === pos;
            const isPlaceholder = overIndex() === pos && draggingIndex() !== null;
            const item = props.items[itemIdx];
            return (
              <li
                data-index={pos}
                onPointerDown={(e) => startDrag(pos, e)}
                class={`dnd-item ${isDragging ? "dragging" : ""} ${isPlaceholder ? "placeholder" : ""} ${overIndex() === pos ? "drag-over" : ""}`}
              >
                {props.renderItem(item, itemIdx)}
              </li>
            );
          }}
        </For>

        {draggingIndex() !== null && dragX() !== null && dragY() !== null && (
          <li
            class="dnd-item floating large-elevate border no-margin no-padding secondary"
            ref={floatingRef as HTMLLIElement}
            style={{
              left: `${dragX()! - offsetX}px`,
              top: `${dragY()! - offsetY}px`,
            }}
          >
            {props.renderItem(props.items[order()[draggingIndex()!]], order()[draggingIndex()!])}
          </li>
        )}

      </ul>
    </div>
  );
}
