import { createMemo } from "solid-js";
import { useParams } from "@solidjs/router";
import { timelineItems } from "../../stores/timelineItems";

export default function TimelineItemView() {
    const params = useParams();

    const item = createMemo(() => timelineItems[params.id]);

    return <div>{item()?.renderFull() ?? <p>Item not found</p>}</div>;
}
