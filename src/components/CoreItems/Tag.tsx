import { For, Show, type JSX } from 'solid-js';
import { removeTag, removeTagInstances, tags } from '../../stores';
import { A, useNavigate } from '@solidjs/router';
import { useChildRoute } from '../ChildRoute';
import { showConfirm } from '../../stores/modals';

export class Tag {
    id!: string;
    title!: string;
    color?: string;
    notes?: string[];

    static Tooltip(props: { id: string, align: string }) {
        const { childRoute } = useChildRoute();
        const link = () => childRoute('tag/' + props.id);
        const tagId = props.id;
        return (
            <div class={"tooltip max " + (props.align || "bottom")} >
                <b>
                    <div class="block"
                        style={`--this-clr:${tags[props.id].details.clr}`}
                    />
                    {tags[tagId].title}</b>
                <Show when={tags[tagId].details.text}>
                    <p>{tags[tagId].details.text}</p>
                </Show>
                <nav>
                    <A href={link()} class="transparent">View</A>
                </nav>
            </div>
        )
    }

    static Compact(props: { id: string }) {
        const navigate = useNavigate();
        const { childRoute } = useChildRoute();
        const tagId = props.id;
        const link = () => childRoute('tag/' + props.id);
        return (
            <button onClick={() => navigate(link())}
                class="circle tag"
                style={{
                    color: tags[tagId].details.clr || 'white',
                    "background-color": tags[tagId].details.clr || 'black',
                }}
            >
                <i>tag</i>
                <Tag.Tooltip id={props.id} align="left" />
            </button>
        );
    }

    static async confirmAndRemoveTag(tagId: string) {
        const confirmed = await showConfirm(`Do you wish to delete the tag, "${tags[tagId].title
            }"?`);
        if (!confirmed) return;
        await removeTagInstances(tagId);
    }

    static Chip(props: { id?: string, addToId?: string, fill?: boolean }) {
        const navigate = useNavigate();
        const { childRoute } = useChildRoute();
        const tagId = props.id;
        if (tagId) {
            return (
                <div>
                    <button onClick={() => navigate(childRoute('tag/' + tagId))}
                        class="tag chip small"
                        style={
                            `--this-clr:${tags[tagId].details.clr}`
                            + (props.fill ? `;background-color:${tags[tagId].details.clr}` : '')
                        }
                    >
                        <span># {tags[tagId].title}</span>
                        <Tag.Tooltip id={tagId} align="bottom" />
                    </button>

                    <button class="small transparent no-padding" onClick={() => Tag.confirmAndRemoveTag(tagId)}>
                        <i>delete</i>
                    </button>
                </div>
            );
        }

        return (
            <button class="tag chip small" onClick={() => navigate(childRoute('attach-new/tag/' + props.addToId))} >
                <i>add</i>Add Tag
            </button>
        );
    }

    constructor(data: Partial<Tag>) {
        Object.assign(this, data);
    }

    renderCompact() { return this.title; }
}

export function reviveTag(obj: any) { return new Tag(obj); }
