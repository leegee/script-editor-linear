import { JSX, createSignal, createEffect, For } from "solid-js";
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

  createEffect(() => {
    const newIds = props.items.map(i => i.id);
    const curOrder = order().map(i => props.items[i]?.id).filter(Boolean) as string[];

    const kept = curOrder.filter(id => newIds.includes(id));
    const added = newIds.filter(id => !kept.includes(id));

    const nextOrder = [...kept, ...added].map(id => newIds.indexOf(id));

    // Only setOrder if it’s actually different
    const isDifferent = nextOrder.length !== order().length || nextOrder.some((v, i) => v !== order()[i]);
    if (isDifferent) {
      setOrder(nextOrder);
    }
  });


  function handleInsertBefore(pos: number): void {
    throw new Error("Function not implemented.");
  }

  function handleInsertAfter(pos: number): void {
    throw new Error("Function not implemented.");
  }

  function handleDelete(pos: number): void {
    throw new Error("Function not implemented.");
  }

  function startDrag(index: number, startDragEvent: PointerEvent) {
    setDraggingIndex(index);
    setOverIndex(index);
    setDragX(startDragEvent.clientX);
    setDragY(startDragEvent.clientY);
    const originalOrder = [...order()];
    const targetEl = startDragEvent.currentTarget as HTMLElement;
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
      if (e && e.key !== "Escape") return;
      try {
        setOrder(originalOrder);
        targetEl.classList.remove("clicked");
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
    <ul class="drag-list list border no-space" style="position:relative">
      <For each={props.items}>
        {(item, idx) => {
          const pos = order().indexOf(idx()); // for drag visual order
          const isDragging = draggingIndex() === pos;
          const isPlaceholder = overIndex() === pos && draggingIndex() !== null;
          const itemX = props.getItemX?.(item) ?? 0;

          return (
            <li
              data-index={pos}
              class={`dnd-item ${isDragging ? "dragging" : ""} ${isPlaceholder ? "placeholder" : ""} ${overIndex() === pos ? "drag-over" : ""}`}
              style={props.viewMode === "timeline" ? { position: "absolute", left: `${itemX}px`, top: "0px" } : {}}
            >
              <DragHandleWithMenu
                onPointerDown={(e) => startDrag(pos, e)}
                onDuplicate={() => duplicateTimelineItem(item.id, { insertAtIndex: pos + 1 })}
                onInsertBefore={() => handleInsertBefore(pos)}
                onInsertAfter={() => handleInsertAfter(pos)}
                onDelete={() => handleDelete(pos)}
              />
              <div>{props.renderItem(item, idx())}</div>
            </li>
          );
        }}
      </For>

      {draggingIndex() !== null && dragX() !== null && dragY() !== null && (
        <li
          class="dnd-item floating large-elevate border no-margin no-padding secondary"
          ref={floatingRef as HTMLLIElement}
          style={{
            left: props.viewMode === "timeline" ? `${dragX()! - offsetX}px` : "auto",
            top: props.viewMode === "timeline" ? "50%" : `${dragY()! - offsetY}px`,
          }}
        >
          {props.renderItem(props.items[order()[draggingIndex()!]], order()[draggingIndex()!])}
        </li>
      )}

    </ul>
  );
}
