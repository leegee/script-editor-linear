import { createMemo } from "solid-js";
import { orderedItems } from ".";
import { TimelineItem } from "../components/CoreItems/";

export const timelineViewModel = createMemo(() => {
    const items = orderedItems();
    if (!items.length) return { sections: {}, totalDuration: 0 };

    // Section mapping for display lanes
    const sectionMap: Record<string, string[]> = {
        "Structural Markers": ["act", "scene", "beat"],
        "Script Items": ["dialogue", "action"],
        "Technical Cues": ["sound", "lighting", "camera"],
        "Meta / Transition": ["transition", "pause"],
        "Locations": ["location"],
    };

    // Reverse map type → section
    const typeToSection: Record<string, string> = Object.entries(sectionMap)
        .flatMap(([section, types]) => types.map((t) => [t, section]))
        .reduce(
            (acc, [t, section]) => ((acc[t as string] = section as string), acc),
            {} as Record<string, string>
        );

    // Group items by section
    const sections: Record<string, TimelineItem[]> = {};
    for (const item of items) {
        const section = typeToSection[item.type] ?? "Uncategorized";
        if (!sections[section]) sections[section] = [];
        sections[section].push(item);
    }

    // Total duration of timeline (based on last item's end)
    const totalDuration = items.reduce(
        (max, item) => Math.max(max, (item.details.end ?? 0)),
        0
    );

    return { sections, totalDuration };
});
