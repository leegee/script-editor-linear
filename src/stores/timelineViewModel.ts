import { createMemo } from "solid-js";
import { orderedItems } from "./timelineItems";

export const timelineViewModel = createMemo(() => {
    const items = orderedItems();
    if (!items.length) return { sections: {}, totalDuration: 0 };

    const totalDuration = items.reduce(
        (max, item) => Math.max(max, (item.details.start ?? 0) + (item.duration ?? 0)),
        0
    );

    const sectionMap: Record<string, string[]> = {
        "Structural Markers": ["act", "scene", "beat"],
        "Script Items": ["dialogue", "action"],
        "Technical Cues": ["sound", "lighting", "camera"],
        "Meta / Transition": ["transition"],
    };

    const typeToSection: Record<string, string> = Object.entries(sectionMap)
        .flatMap(([section, types]) => types.map((t) => [t, section]))
        .reduce(
            (acc, [t, section]) => ((acc[t as string] = section as string), acc),
            {} as Record<string, string>
        );

    const computed = [];
    const sorted = [...items].sort((a, b) => (a.details.start ?? 0) - (b.details.start ?? 0));

    for (let i = 0; i < sorted.length; i++) {
        const item = sorted[i];
        const section = typeToSection[item.type] ?? "Uncategorized";
        const start = item.details.start ?? 0;

        let duration = item.duration ?? 0;

        // Compute implicit duration for structural markers
        if (["act", "scene", "beat"].includes(item.type)) {
            const nextSameType = sorted.slice(i + 1).find((n) => n.type === item.type);
            duration = nextSameType
                ? (nextSameType.details.start ?? 0) - start
                : totalDuration - start;
        }

        computed.push({
            ...item,
            section,
            start,
            duration,
            end: start + duration,
        });
    }

    const sections: Record<string, typeof computed> = {};
    for (const item of computed) {
        if (!sections[item.section]) sections[item.section] = [];
        sections[item.section].push(item);
    }

    return { sections, totalDuration };
});
