import { createMemo } from "solid-js";
import { useParams } from "@solidjs/router";
import { locations } from "../../stores";
import { TimelineLocationItem } from "../CoreItems";

export default function CharacterView() {
    const params = useParams();

    const item = createMemo(() => locations[params.id]);

    return <div>
        {item()?.renderFull() ?? <TimelineLocationItem.ListLocations />}
    </div>
}
