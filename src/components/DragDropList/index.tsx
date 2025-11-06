import "./DragDropList.scss";
import { createSignal, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { List } from '@solid-primitives/list';

import DragHandleWithMenu from "./DragHandleWithMenu";
import { duplicateTimelineItem } from "../../lib/duplicateTimelineItem";
import { createTimelineItem, deleteTimelineItemById } from "../../lib/createTimelineItem";
import { reorderTimeline, timelineItems, timelineSequence } from "../../stores";
import { createTimelineItemInstance } from "../../lib/timelineItemRegistry";
import { showAlert } from "../../stores/modals";
import { type TimelineItem } from "../CoreItems";
import { childRoute } from "../../lib/routeResolver";

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export default function DragDropList() {
  const navigate = useNavigate();
  const items = () => timelineSequence().map(id => timelineItems[id]).filter(Boolean);
  const [draggingIndex, setDraggingIndex] = createSignal<number | null>(null);
  const draggingId = () => timelineSequence()[draggingIndex()!];
  const [overIndex, setOverIndex] = createSignal<number | null>(null);
  const [selectedId, setSelectedId] = createSignal<string | null>(null);
  const [dragX, setDragX] = createSignal<number | null>(null);
  const [dragY, setDragY] = createSignal<number | null>(null);
  let floatingRef: HTMLElement | undefined;
  let offsetY = 0;
  let listRef: HTMLUListElement | undefined;

  function selectItem(item: TimelineItem, index: number) {
    if (selectedId() === item.id) return;

    setSelectedId(item.id);
    const el = document.querySelector(`[data-index="${index}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: "nearest" });

    listRef?.focus();
  }

  // Keyboard navigation attached to the list only
  async function handleKey(e: KeyboardEvent) {
    if (!items().length) return;

    const currentId = selectedId();
    let currentIndex = items().findIndex(i => i.id === currentId);
    if (currentIndex === -1) currentIndex = 0;

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const delta = e.key === "ArrowDown" ? 1 : -1;
      const nextIndex = Math.min(
        items().length - 1,
        Math.max(0, currentIndex + delta)
      );
      selectItem(items()[nextIndex], nextIndex);
    }

    else if (e.key === "Enter") {
      if (
        e.currentTarget instanceof HTMLInputElement ||
        e.currentTarget instanceof HTMLTextAreaElement ||
        e.currentTarget instanceof HTMLSelectElement
      ) return;

      e.preventDefault();

      if (e.ctrlKey) {
        const idx = items().findIndex(i => i.id === selectedId());
        if (idx === -1) {
          showAlert('To insert a new dialogue item, select a position in the script.')
          return;
        }
        // items()[idx].openEditor();
        // Add a new dialogue item and open it
        // newTimelineItem
        const insertAtIndex = idx + 1;
        const itemInstance = createTimelineItemInstance("dialogue");
        const prepared = itemInstance.prepareFromFields({});
        const newItem = await createTimelineItem({ ...prepared, type: "dialogue" }, { insertAtIndex });
        currentIndex = insertAtIndex;
        selectItem(items()[currentIndex], currentIndex);
        navigate(`/script/items/${newItem.id}`);
      }
      else {
        selectItem(items()[currentIndex], currentIndex);
        navigate(`/script/items/${items()[currentIndex].id}`)
      }
    }
  }

  function startDrag(index: number, e: PointerEvent) {
    e.stopPropagation();
    setDraggingIndex(index);
    setOverIndex(index);
    setDragX(e.clientX);
    setDragY(e.clientY);
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
        const seq = [...timelineSequence()];
        const [movedId] = seq.splice(src, 1);
        seq.splice(dest, 0, movedId);
        reorderTimeline(seq);
      }

      setDraggingIndex(null);
      setOverIndex(null);
      setDragX(null);
      setDragY(null);
    }

    function cancelDrag(ke: KeyboardEvent) {
      if (ke.key !== "Escape") return;
      try {
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
      <List each={timelineSequence()}>
        {(id, idx) => {
          const item = () => timelineItems[id()];
          if (!item()) return null;

          const pos = idx();
          if (pos === -1) return null;

          const isDragging = draggingIndex() === pos;
          const isPlaceholder = overIndex() === pos && draggingIndex() !== null;

          const cumulativeSeconds = items()
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
              <div class="max item-content" onClick={() => navigate(`/script/items/${item().id}`)}>
                <small class="time-label">{displayTime}</small>
                {item().renderCompact() ?? null}
              </div>

              <DragHandleWithMenu
                class="show-on-hover"
                onPointerDown={(e) => startDrag(pos, e)}
                onAddNote={() => navigate('/script/attach-new/note/' + item().id)}
                onAddTag={() => navigate('/script/attach-new/tag/' + item().id)}
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
        <div class="item-content" onClick={() => navigate(
          childRoute(`new/${timelineSequence().length}`)
        )}>
          <small class="time-label">{formatTime(
            items().reduce((sum, i) => sum + (i.duration ?? 0), 0)
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
          {timelineItems[draggingId()]?.renderCompact?.() ?? null}
        </li>
      )}
    </ul>
  );
}
