import "./Note.css";
import { notes, settings, timelineItemsByNote } from '../../stores';
import { A, useNavigate } from '@solidjs/router';
import { useChildRoute } from '../ChildRoute';
import { createMemo, For, Show } from 'solid-js';
import { TimelineItem, TimelineItemProps } from "./TimelineItem";

export class Note extends TimelineItem {
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

    private static ImageButton(props: { id: string }) {
        const navigate = useNavigate();
        const { childRoute } = useChildRoute();

        return (
            <button class="transparent square extra" onClick={() => navigate(childRoute('note/' + props.id))}>
                <img class="responsive" alt={notes[props.id].title}
                    src={notes[props.id].details.urls![0]}
                />
            </button>
        )
    }

    static Compact(props: { id: string }) {
        const navigate = useNavigate();
        const { childRoute } = useChildRoute();
        const link = () => childRoute('note/' + props.id);

        if (settings.noteChipsAsPics && notes[props.id].details.urls) {
            return <Note.ImageButton id={props.id} />;
        }

        return (
            <button onClick={() => navigate(link())} class="circle note"
                style={{
                    color: notes[props.id].details.clr,
                    "background-color": notes[props.id].details.clr,
                }}
            >
                <em>&</em>
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
        if (props.id) {
            if (settings.noteChipsAsPics && notes[props.id].details.urls) {
                return <Note.ImageButton id={props.id} />;
            }

            return (
                <button class="note chip small" style={
                    `--this-clr:${notes[props.id].details.clr}`
                    + (props.fill ? `;background-color:${notes[props.id].details.clr}` : '')
                } onClick={() => navigate(childRoute('note/' + props.id))}
                >
                    <span>&{notes[props.id].title}</span>
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

    constructor(obj: Partial<Note>) {
        super(obj as TimelineItemProps);
        // Object.assign(this, obj);
    }

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

    showUrl(size = "tiny") {
        if (!this.details.urls) return "";
        return `<img class="responsive" src="${this.details.urls[0]
            }"/>`;
    }

    renderCompact() { return this.title; }
}

export function reviveNote(obj: any) { return new Note(obj); }
