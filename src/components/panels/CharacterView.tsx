import { createMemo } from "solid-js";
import { useParams } from "@solidjs/router";
import { characters } from "../../stores";
import { CharacterItem } from "../CoreItems";

export default function CharacterView() {
    const params = useParams();

    const item = createMemo(() => characters[params.id]);

    return <div>
        {item()?.renderFull() ?? <CharacterItem.ListCharacters />}
    </div>;
}
