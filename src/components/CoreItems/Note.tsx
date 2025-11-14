import "./Note.css";
import { notes, timelineItemsByNote } from '../../stores';
import { A, useNavigate } from '@solidjs/router';
import { useChildRoute } from '../ChildRoute';
import { createMemo, For, Show } from 'solid-js';

export class Note {
    id!: string;
    title!: string;

    // static Tooltip(props: { id: string, align: string }) {
    //     const { childRoute } = useChildRoute();
    //     const link = () => childRoute('tag/' + props.id);
    //     const tagId = props.id;
    //     return (
    //         <div class={"tooltip max " + (props.align || "bottom")} >
    //             <b>
    //                 <div class="block"
    //                     style={`--this-clr:${tags[props.id].details.clr}`}
    //                 />
    //                 {tags[tagId].title}</b>
    //             <Show when={tags[tagId].details.text}>
    //                 <p>{tags[tagId].details.text}</p>
    //             </Show>
    //             <nav>
    //                 <A href={link()} class="transparent">View</A>
    //             </nav>
    //         </div>
    //     )
    // }

    static Compact(props: { id: string }) {
        const navigate = useNavigate();
        const { childRoute } = useChildRoute();
        const noteId = props.id;
        const link = () => childRoute('note/' + props.id);
        return (
            <button onClick={() => navigate(link())} class="circle note"
                style={{
                    color: notes[noteId].details.clr,
                    "background-color": notes[noteId].details.clr,
                }}
            >
                <em>@</em>
                {/* <Note.Tooltip id={props.id} align="left" /> */}
            </button>
        );
    }

    static Chip(props: {
        id?: string,
        addToId?: string,
        fill?: boolean,
        index?: number,
    }) {
        const navigate = useNavigate();
        const { childRoute } = useChildRoute();
        const noteId = props.id;
        if (noteId) {
            return (
                <button class="note chip small" style={
                    `--this-clr:${notes[noteId].details.clr}`
                    + (props.fill ? `;background-color:${notes[noteId].details.clr}` : '')
                }
                    onClick={() => navigate(childRoute('note/' + noteId))}
                >
                    <span># {notes[noteId].title}</span>
                    {/* <Note.Tooltip id={props.id} align={props.index === 0? "right" : "bottom"} /> */}
                </button>
            );
        }

        return (
            <button class="note chip small" onClick={() => navigate(childRoute(`/attach-new/note/${props.addToId}`))} >
                <i>add</i>
                <span>Add Note</span>
            </button>
        );
    }

    constructor(data: Partial<Note>) {
        Object.assign(this, data);
    }

    renderCompact() { return this.title; }

    static ListNotes = (props: { id?: string }) => {
        const { childRoute } = useChildRoute();

        const tagValues = createMemo(() => {
            if (props.id && notes[props.id]) return [notes[props.id]];
            return Object.values(notes);
        });

        const renderItems = (tagId: string) => (
            <ul>
                <For each={timelineItemsByNote()[tagId] ?? []}>
                    {(item) => (
                        <li>
                            <A href={childRoute(`/notes/${tagId}`)}>
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

export function reviveNote(obj: any) { return new Note(obj); }
