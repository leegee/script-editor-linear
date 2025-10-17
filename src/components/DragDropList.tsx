import { JSX, createSignal, createEffect, For, Accessor } from "solid-js";
import "./DragDropList.scss";
import DragHandleWithMenu from "./DragHandleWithMenu";
import { duplicateTimelineItem } from "../lib/duplicateTimelineItem";

interface HasId {
  id: string;
}

interface DragDropListProps<T extends HasId> {
  items: T[];
  renderItem: (item: T, index: number) => JSX.Element | null;
  onReorder?: (newOrder: number[]) => void;
  className?: string;
  viewMode?: "list" | "timeline";
  getItemX?: (item: T) => number;
}

export default function DragDropList<T extends HasId>(props: DragDropListProps<T>) {
  const [order, setOrder] = createSignal(props.items.map((_, i) => i));
  const [draggingIndex, setDraggingIndex] = createSignal<number | null>(null);
  const [overIndex, setOverIndex] = createSignal<number | null>(null);
  const [dragX, setDragX] = createSignal<number | null>(null);
  const [dragY, setDragY] = createSignal<number | null>(null);
  let floatingRef: HTMLElement | undefined;

  let offsetX = 0;
  let offsetY = 0;

  // Reconcile order with changes in props.items
  createEffect(() => {
    const newIds = props.items.map(i => i.id);
    const oldIds = order().map(i => props.items[i]?.id).filter(Boolean) as string[];

    const kept = oldIds.filter(id => newIds.includes(id));
    const added = newIds.filter(id => !kept.includes(id));
    const nextOrder = [...kept, ...added].map(id => newIds.indexOf(id));

    const changed = nextOrder.length !== order().length || nextOrder.some((v, i) => v !== order()[i]);
    if (changed) setOrder(nextOrder);
  });

  function startDrag(index: number, e: PointerEvent) {
    setDraggingIndex(index);
    setOverIndex(index);
    setDragX(e.clientX);
    setDragY(e.clientY);
    const originalOrder = [...order()];
    const targetEl = e.currentTarget as HTMLElement;
    targetEl.classList.add("clicked");
    targetEl.setPointerCapture?.(e.pointerId);
    const rect = targetEl.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    function move(me: PointerEvent) {
      setDragX(me.clientX);
      setDragY(me.clientY);
      if (!floatingRef) return;

      floatingRef.style.display = "none"; // hide while measuring
      const target = document.elementFromPoint(me.clientX, me.clientY);
      floatingRef.style.display = "";
      const el = target?.closest("[data-index]") as HTMLElement | null;
      if (el) setOverIndex(Number(el.dataset.index));
    }

    function end() {
      try {
        targetEl.classList.remove("clicked");
        targetEl.releasePointerCapture?.(e.pointerId);
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

    function cancelDrag(ke: KeyboardEvent) {
      if (ke.key !== "Escape") return;
      try {
        setOrder(originalOrder);
        targetEl.classList.remove("clicked");
        targetEl.releasePointerCapture?.(e.pointerId);
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

  function handleInsertBefore(pos: number) { /* implement */ }
  function handleInsertAfter(pos: number) { /* implement */ }
  function handleDelete(pos: number) { /* implement */ }

  return (
    <ul class="drag-list list border no-space">
      <For each={props.items}>
        {(item, idx: Accessor<number>) => {
          const pos = order().indexOf(idx());
          const isDragging = draggingIndex() === pos;
          const isPlaceholder = overIndex() === pos && draggingIndex() !== null;
          const itemX = props.getItemX?.(item) ?? 0;

          return (
            <li
              data-index={pos}
              class="dnd-item"
              classList={{
                dragging: isDragging,
                placeholder: isPlaceholder,
                "drag-over": overIndex() === pos
              }}
            >
              <DragHandleWithMenu
                onPointerDown={(e) => startDrag(pos, e)}
                onDuplicate={() => duplicateTimelineItem(item.id, { insertAtIndex: pos + 1 })}
                onInsertBefore={() => handleInsertBefore(pos)}
                onInsertAfter={() => handleInsertAfter(pos)}
                onDelete={() => handleDelete(pos)}
              />
              {props.renderItem(item, idx())}
            </li>
          );
        }}
      </For>

      {draggingIndex() !== null && dragX() !== null && dragY() !== null && (
        <li ref={floatingRef as HTMLLIElement}
          class="dnd-item floating large-elevate border no-margin no-padding secondary"
          classList={{ dragging: draggingIndex() !== null }}
          style={{
            top: `${dragY()! - offsetY}px`,
          }}
        >
          {props.renderItem(props.items[order()[draggingIndex()!]], order()[draggingIndex()!])}
        </li>
      )}
    </ul>
  );
}
