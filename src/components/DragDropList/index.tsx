import "./DragDropList.scss";
import { JSX, createSignal, createEffect, Accessor, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { List } from '@solid-primitives/list';

import DragHandleWithMenu from "./DragHandleWithMenu";
import { duplicateTimelineItem } from "../../lib/duplicateTimelineItem";
import { createTimelineItem, deleteTimelineItemById } from "../../lib/createTimelineItem";
import { reorderTimeline, timelineSequence } from "../../stores";
import { createTimelineItemInstance } from "../../lib/timelineItemRegistry";
import { showAlert } from "../../stores/modals";
import { CanonicalNote } from "../CoreItems/Notes/CanonicalNote";
import { type TimelineItem } from "../CoreItems";

interface HasIdAndDuration {
  id: string;
  duration?: number;
  type: string;
  renderCompact: () => JSX.Element | null;
  openEditor: () => void;
}

interface DragDropListProps<T extends HasIdAndDuration> {
  items: Accessor<T[]>;
  className?: string;
  viewMode?: "list" | "timeline";
  getItemX?: (item: T) => number;
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export default function DragDropList<T extends HasIdAndDuration>(props: DragDropListProps<T>) {
  const navigate = useNavigate();
  const [order, setOrder] = createSignal(props.items().map((_, i) => i));
  const [draggingIndex, setDraggingIndex] = createSignal<number | null>(null);
  const [overIndex, setOverIndex] = createSignal<number | null>(null);
  const [selectedId, setSelectedId] = createSignal<string | null>(null);
  const [dragX, setDragX] = createSignal<number | null>(null);
  const [dragY, setDragY] = createSignal<number | null>(null);
  let floatingRef: HTMLElement | undefined;
  let offsetY = 0;
  let listRef: HTMLUListElement | undefined;

  // Reconcile order with changes in props.items
  createEffect(() => {
    const newIds = props.items().map(i => i.id);
    const oldIds = order().map(i => props.items()[i]?.id).filter(Boolean) as string[];

    const kept = oldIds.filter(id => newIds.includes(id));
    const added = newIds.filter(id => !kept.includes(id));

    const addedIndices = added.map(id => newIds.indexOf(id));
    const nextOrder = [...kept.map(id => newIds.indexOf(id)), ...addedIndices];

    const changed = nextOrder.length !== order().length || nextOrder.some((v, i) => v !== order()[i]);
    if (changed) setOrder(nextOrder);
  });

  function selectItem(item: T, index: number) {
    if (selectedId() === item.id) return;

    setSelectedId(item.id);
    const el = document.querySelector(`[data-index="${index}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: "nearest" });

    listRef?.focus();
  }

  // Keyboard navigation attached to the list only
  async function handleKey(e: KeyboardEvent) {
    if (!props.items().length) return;

    const currentId = selectedId();
    let currentIndex = props.items().findIndex(i => i.id === currentId);
    if (currentIndex === -1) currentIndex = 0;

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const delta = e.key === "ArrowDown" ? 1 : -1;
      const nextIndex = Math.min(
        props.items().length - 1,
        Math.max(0, currentIndex + delta)
      );
      selectItem(props.items()[nextIndex], nextIndex);
    }

    else if (e.key === "Enter") {
      if (
        e.currentTarget instanceof HTMLInputElement ||
        e.currentTarget instanceof HTMLTextAreaElement ||
        e.currentTarget instanceof HTMLSelectElement
      ) return;

      e.preventDefault();

      if (e.ctrlKey) {
        const idx = props.items().findIndex(i => i.id === selectedId());
        if (idx === -1) {
          showAlert('To insert a new dialogue item, select a position in the script.')
          return;
        }
        // props.items()[idx].openEditor();
        // Add a new dialogue item and open it
        // newTimelineItem
        const insertAtIndex = idx + 1;
        const itemInstance = createTimelineItemInstance("dialogue");
        const prepared = itemInstance.prepareFromFields({});
        const newItem = await createTimelineItem({ ...prepared, type: "dialogue" }, { insertAtIndex });
        currentIndex = insertAtIndex;
        selectItem(props.items()[currentIndex], currentIndex);
        navigate(`/script/items/${newItem.id}`);
      }
      else {
        selectItem(props.items()[currentIndex], currentIndex);
        navigate(`/script/items/${props.items()[currentIndex].id}`)
      }
    }
  }

  function startDrag(index: number, e: PointerEvent) {
    e.stopPropagation();
    setDraggingIndex(index);
    setOverIndex(index);
    setDragX(e.clientX);
    setDragY(e.clientY);
    const originalOrder = [...order()];
    const targetEl = e.currentTarget as HTMLElement;
    targetEl.classList.add("clicked");
    targetEl.setPointerCapture?.(e.pointerId);
    const rect = targetEl.getBoundingClientRect();
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
        const seq = timelineSequence();
        const newSeq = next.map(i => seq[i]);
        reorderTimeline(newSeq);
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

  onMount(() => listRef?.focus())

  return (
    <ul
      tabIndex={0}
      class="drag-list list border no-space scroll"
      ref={listRef}
      tabindex={0}
      onKeyDown={handleKey}
    >
      <List each={props.items()}>
        {(item, idx: Accessor<number>) => {
          const pos = idx();
          if (pos === -1) return null;

          const isDragging = draggingIndex() === pos;
          const isPlaceholder = overIndex() === pos && draggingIndex() !== null;

          const cumulativeSeconds = props.items()
            .slice(0, pos)
            .reduce((sum, i) => sum + (i.duration ?? 0), 0);
          const displayTime = formatTime(cumulativeSeconds);

          const insertBefore = pos > 0 ? pos - 1 : 0;
          const insertAfter = pos >= 0 ? pos + 1 : timelineSequence().length;

          return (
            <li
              data-index={pos}
              class="dnd-item"
              onClick={() => selectItem(item(), pos)}
              classList={{
                [item().type]: true,
                selected: selectedId() === item().id,
                dragging: isDragging,
                placeholder: isPlaceholder,
                "drag-over": overIndex() === pos
              }}
            >
              <div class="item-content" onClick={() => navigate(`/script/items/${item().id}`)}>
                <small class="time-label">{displayTime}</small>
                {item().renderCompact() ?? null}
              </div>

              <DragHandleWithMenu
                class="show-on-hover"
                onPointerDown={(e) => startDrag(pos, e)}
                onAddNote={() => navigate('/script/new/note/' + item().id)}
                onDuplicate={() => duplicateTimelineItem(item().id, { insertAtIndex: insertAfter })}
                onInsertBefore={() => navigate(`/script/new/${insertBefore}`)}
                onInsertAfter={() => navigate(`/script/new/${insertAfter}`)}
                onDelete={() => { deleteTimelineItemById(item().id); navigate('/script') }}
              />
            </li>
          );
        }}
      </List>

      {/* NEW ITEM placeholder */}
      <li class="dnd-item">
        <div class="item-content" onClick={() => navigate(`/script/new/${timelineSequence().length}`)}>
          <small class="time-label">{formatTime(
            props.items().reduce((sum, i) => sum + (i.duration ?? 0), 0)
          )}</small>
          + NEW ITEM
        </div>
      </li>

      {/* Floating drag preview */}
      {draggingIndex() !== null && dragX() !== null && dragY() !== null && (
        <li ref={floatingRef as HTMLLIElement}
          class="dnd-item floating large-elevate border no-margin no-padding secondary"
          classList={{ dragging: draggingIndex() !== null }}
          style={{ top: `${dragY()! - offsetY}px` }}>
          {props.items()[order()[draggingIndex()!]].renderCompact() ?? null}
        </li>
      )}
    </ul>
  );
}
