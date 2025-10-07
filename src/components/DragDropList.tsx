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

  function startDrag(index: number, e: PointerEvent) {
    setDraggingIndex(index);
    setOverIndex(index);
    setDragX(e.clientX);
    setDragY(e.clientY);
    const targetEl = e.target as HTMLElement;
    targetEl.classList.add("clicked");
    targetEl.setPointerCapture?.(e.pointerId);

    function move(ev: PointerEvent) {
      setDragX(ev.clientX);
      setDragY(ev.clientY);
      if (!floatingRef) return;
      floatingRef.style.display = "none";
      const target = document.elementFromPoint(ev.clientX, ev.clientY);
      floatingRef.style.display = "";
      const el = target?.closest("[data-index]") as HTMLElement | null;
      if (el) setOverIndex(Number(el.dataset.index));
    }

    function end() {
      try { targetEl.classList.remove("clicked"); targetEl.releasePointerCapture?.(e.pointerId); } catch { }
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

    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", end);
  }

  return (
    <div class={props.className ?? "drag-list"}>
      <ul class="list border no-space">
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
                class={`dd-item ${isDragging ? "dragging" : ""} ${isPlaceholder ? "placeholder" : ""}`}
              >
                {props.renderItem(item, itemIdx)}
              </li>
            );
          }}
        </For>
        {draggingIndex() !== null && dragX() !== null && dragY() !== null && (
          <li
            class="floating large-elevate border no-margin no-padding secondary"
            ref={floatingRef as HTMLLIElement}
            style={{ position: "fixed", left: `${dragX()!}px`, top: `${dragY()!}px`, transform: "translate(-50%,-2em)" }}
          >
            {props.renderItem(props.items[order()[draggingIndex()!]], order()[draggingIndex()!])}
          </li>
        )}
      </ul>
    </div>
  );
}
