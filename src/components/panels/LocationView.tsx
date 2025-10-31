import { createMemo } from "solid-js";
import { useParams } from "@solidjs/router";
import { locations } from "../../stores";
import { TimelineLocationItem } from "../CoreItems";
import PanelSectionHeader from "../PanelSectionHeader";

export default function CharacterView() {
    const params = useParams();

    const item = createMemo(() => locations[params.id]);

    return <div>
        {item()?.renderFull() ?? (
            <article class="border">
                <PanelSectionHeader title='Locations' icon='location_on' />
                <TimelineLocationItem.ListAllLocations />
            </article>
        )}
    </div>
}
