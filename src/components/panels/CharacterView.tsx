import { createMemo } from "solid-js";
import { useParams } from "@solidjs/router";
import { characters } from "../../stores";
import { CharacterItem } from "../CoreItems";
import PanelSectionHeader from "../PanelSectionHeader";

export default function CharacterView() {
    const params = useParams();

    const item = createMemo(() => characters[params.id]);

    return <div>
        {item()?.renderFull() ?? (
            <article class="no-margin">
                <PanelSectionHeader title='Characters' icon='people' />
                <CharacterItem.ListAllCharacters />
            </article>
        )}
    </div>;
}
