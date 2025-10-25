import { createMemo } from "solid-js";
import { orderedItems } from ".";
import { type TimelineItem } from "../components/CoreItems/";

// Ordered section map
export const sectionMap = [
    { name: "Locations", types: ["location"] },
    { name: "Structure", types: ["act", "scene", "beat"] },
    { name: "Script", types: ["dialogue", "action", "pause"] },
    { name: "Sound Cues", types: ["soundfx", "music"] },
    { name: "Visual Cues", types: ["lighting", "camera", "transition"] },
    // { name: "Meta", types: [] },
];

// Map type → section for quick lookup
const typeToSection: Record<string, string> = sectionMap
    .flatMap(({ name, types }) => types.map((t) => [t, name] as const))
    .reduce((acc, [t, section]) => ((acc[t] = section), acc), {} as Record<string, string>);

export const timelineViewModel = createMemo(() => {
    const items = orderedItems();
    if (!items.length) return { sections: {}, totalDuration: 0 };

    // Group items by section
    const sections: Record<string, TimelineItem[]> = {};
    for (const item of items) {
        const section = typeToSection[item.type] ?? "Uncategorized";
        if (!sections[section]) sections[section] = [];
        sections[section].push(item);
    }

    // Sort sections by sectionMap order
    const sortedSections: Record<string, TimelineItem[]> = {};
    for (const { name } of sectionMap) {
        if (sections[name]) sortedSections[name] = sections[name];
    }
    // Add Uncategorized at the end if exists
    if (sections["Uncategorized"]) sortedSections["Uncategorized"] = sections["Uncategorized"];

    // Total duration (based on last item's end)
    const totalDuration = items.reduce((max, item) => Math.max(max, item.details.end ?? 0), 0);

    return { sections: sortedSections, totalDuration };
});
