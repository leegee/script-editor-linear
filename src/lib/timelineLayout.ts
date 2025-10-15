import { ScriptItem } from "../classes/CoreItems";

export interface TimelineLayoutItem {
    item: ScriptItem;
    x: number; // horizontal px
    y: number; // lane index
}

// options to control spacing
export interface TimelineLayoutOptions {
    totalWidth?: number;      // width of the container in px
    laneHeight?: number;      // vertical spacing per lane
    minSpacing?: number;      // min spacing between items without startTimes
}

export function layoutTimeline(
    items: ScriptItem[],
    opts: TimelineLayoutOptions = {}
): TimelineLayoutItem[] {
    const totalWidth = opts.totalWidth ?? 1000;
    const laneHeight = opts.laneHeight ?? 50;
    const minSpacing = opts.minSpacing ?? 10;

    // Clone to avoid mutating original
    const cloned = [...items];

    // Fill in missing startTimes
    const itemsWithTime = cloned.map((it, idx) => {
        if (it.startTime === undefined || it.startTime === null) {
            // simple even spacing for items without startTime
            it.startTime = idx * minSpacing;
        }
        return it;
    });

    // Sort by startTime
    itemsWithTime.sort((a, b) => (a.startTime! - b.startTime!));

    // Assign lanes to avoid vertical overlaps
    const lanes: ScriptItem[][] = [];
    const layout: TimelineLayoutItem[] = [];

    for (const it of itemsWithTime) {
        let laneIndex = 0;
        while (true) {
            const lane = lanes[laneIndex] ?? [];
            const overlap = lane.some(
                (existing) =>
                    (it.startTime! < (existing.startTime! + existing.duration!)) &&
                    ((it.startTime! + it.duration!) > existing.startTime!)
            );
            if (!overlap) {
                // assign to this lane
                if (!lanes[laneIndex]) lanes[laneIndex] = [];
                lanes[laneIndex].push(it);
                layout.push({ item: it, x: it.startTime!, y: laneIndex * laneHeight });
                break;
            }
            laneIndex++;
        }
    }

    return layout;
}
