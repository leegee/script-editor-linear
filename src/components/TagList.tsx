import { For } from "solid-js";
import { tags, timelineItemsByTag } from "../stores";

export class TagList {
    static ListTags() {
        return (
            <ul class="border list no-space">
                <For each={Object.values(tags)}>
                    {(tag) => (
                        <li>
                            <strong>{tag.title}</strong>
                            <ul>
                                <For each={timelineItemsByTag()[tag.id] ?? []}>
                                    {(item) => <li>{item.title || "(no title)"}</li>}
                                </For>
                            </ul>
                        </li>
                    )}
                </For>
            </ul>
        );
    }
}
