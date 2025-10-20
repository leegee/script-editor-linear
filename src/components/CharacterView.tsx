import { createMemo } from "solid-js";
import { useParams } from "@solidjs/router";
import { characters } from "../stores";

export default function CharacterView() {
    const params = useParams();

    const item = createMemo(() => characters[params.id]);

    return <div>{item()?.renderFull() ?? <p>Character not found</p>}</div>;
}
