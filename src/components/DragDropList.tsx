import { JSX, createSignal, createEffect, For } from "solid-js";
import styles from "./DragDropList.module.scss";

interface DragDropListProps<T = any> {
  items: T[];
  renderItem: (item: T, index: number) => JSX.Element | null;
  onReorder?: (newOrder: number[]) => void;
  className?: string;
  viewMode?: "list" | "timeline";
  getItemX?: (item: T) => number;
  getItemY?: (item: T) => number;
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
    const originalOrder = [...order()];
    const targetEl = startDragEvent.currentTarget as HTMLElement;
    targetEl.classList.add(styles.clicked);
    targetEl.setPointerCapture?.(startDragEvent.pointerId);
    const rect = targetEl.getBoundingClientRect();
    offsetX = startDragEvent.clientX - rect.left;
    offsetY = startDragEvent.clientY - rect.top;

    function move(moveEvent: PointerEvent) {
      setDragX(moveEvent.clientX);
      setDragY(moveEvent.clientY);
      if (!floatingRef) return;
      floatingRef.style.display = "none"; // hide while measuring
      const target = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
      floatingRef.style.display = "";
      const el = target?.closest("[data-index]") as HTMLElement | null;
      if (el) setOverIndex(Number(el.dataset.index));
    }

    function end() {
      try {
        targetEl.classList.remove(styles.clicked);
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
      if (e.key !== "Escape") return;
      try {
        setOrder(originalOrder);
        targetEl.classList.remove(styles.clicked);
        targetEl.releasePointerCapture?.(startDragEvent.pointerId);
      } catch { }

      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", end);
      document.removeEventListener("keydown", cancelDrag);

      setDraggingIndex(null);
      setOverIndex(null);
      setDragX(null);
      setDragY(null);
    }

    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", end);
    document.addEventListener("keydown", cancelDrag);
  }

  return (
    <div
      classList={{
        [styles.dragList]: true,
        [styles.timeline]: props.viewMode === "timeline",
        [props.className!]: !!props.className,
      }}
    >
      <ul class="border no-space" style="position:relative">
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
                class={`${styles.dndItem} ${isDragging ? "dragging" : ""} ${isPlaceholder ? "placeholder" : ""} ${overIndex() === pos ? "dragOver" : ""}`}
                style={
                  props.viewMode === "timeline"
                    ? {
                      "--index": pos.toString(),
                      left: `${props.getItemX?.(item) ?? 0}px`,
                      top: `${props.getItemY?.(item) ?? 0}px`,
                    }
                    : {}
                }
              >
                {props.renderItem(item, itemIdx)}
              </li>
            );
          }}
        </For>

        {draggingIndex() !== null && dragX() !== null && dragY() !== null && (
          <li
            class={`${styles.dndItem} ${styles.floating} large-elevate border no-margin no-padding secondary`}
            ref={floatingRef as HTMLLIElement}
            style={{
              left: props.viewMode === "timeline" ? `${dragX()! - offsetX}px` : "auto",
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
