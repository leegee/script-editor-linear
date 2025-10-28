import { createMemo } from "solid-js";
import { useParams } from "@solidjs/router";
import { timelineItems } from "../../stores/timelineItems";

export default function TimelineItemView() {
    const params = useParams();

    const item = createMemo(() => timelineItems[params.id]);

    return <>{item()?.renderFull() ?? (
        <article>
            <p>Item not found</p>
            <p>Item:</p>
            <pre>
                {JSON.stringify(item, null, 4)}
            </pre>
            <p>Params:</p>
            <pre>
                {JSON.stringify(params, null, 4)}
            </pre>
        </article>
    )}</>;
}
