// TagList.tsx
import { For, createMemo, Show } from "solid-js";
import { tags, timelineItemsByTag } from "../stores";
import { A } from "@solidjs/router";
import { useChildRoute } from "./ChildRoute";

export const tagsActiveCount = () => {
    const values = Object.values(tags);
    const active = values.filter(Boolean).length;
    return values.length - active;
};

export class TagList {
    static ListTags = (props: { id?: string }) => {
        const { childRoute } = useChildRoute();

        const tagValues = createMemo(() => {
            if (props.id && tags[props.id]) return [tags[props.id]];
            return Object.values(tags);
        });

        const renderItems = (tagId: string) => (
            <ul>
                <For each={timelineItemsByTag()[tagId] ?? []}>
                    {(item) => (
                        <li>
                            <A href={childRoute(`/tags/${tagId}`)}>
                                {item.title || "(no title)"}
                            </A>
                        </li>
                    )}
                </For>
            </ul>
        );

        return (
            <Show
                when={props.id}
                fallback={
                    <ul class="border list no-space">
                        <For each={tagValues()}>
                            {(tag) => (
                                <li>
                                    <strong>{tag.title}</strong>
                                    {renderItems(tag.id)}
                                </li>
                            )}
                        </For>
                    </ul>
                }
            >
                {renderItems(props.id!)}
            </Show>
        );
    };
}
