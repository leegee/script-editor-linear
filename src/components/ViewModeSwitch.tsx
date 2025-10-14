import { createSignal, createEffect } from "solid-js";
import { storage } from "../db";

export function ViewModeSwitch(props?: {
    onChange?: (mode: "list" | "timeline") => void;
}) {
    const viewModeKey = "dragListViewMode";
    const [currentView, setCurrentView] = createSignal<"list" | "timeline">("list");

    // Init from IndexedDB
    createEffect(async () => {
        const saved = await storage.getMeta<"list" | "timeline">(viewModeKey);
        if (saved) setCurrentView(saved);
        props?.onChange?.(saved ?? "list");
    });

    function toggle() {
        const next = currentView() === "list" ? "timeline" : "list";
        setCurrentView(next);
        storage.putMeta(viewModeKey, next); // persist
        props?.onChange?.(next);
    }

    return (
        <button onClick={toggle}>
            Switch to {currentView() === "list" ? "Timeline" : "List"} View
        </button>
    );
}
