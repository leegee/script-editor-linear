import { createMemo } from "solid-js";
import { useParams } from "@solidjs/router";
import { locations } from "../stores";

export default function CharacterView() {
    const params = useParams();

    const item = createMemo(() => locations[params.id]);

    return <div>{item()?.renderFull() ?? <p>Location not found</p>}</div>;
}
