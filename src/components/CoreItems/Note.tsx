import { notes } from '../../stores';
import { A, useNavigate } from '@solidjs/router';
import { useChildRoute } from '../ChildRoute';

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

    static Chip(props: { id?: string, addToId?: string, fill?: boolean }) {
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
                    {/* <Note.Tooltip id={props.id} align="bottom" /> */}
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
}

export function reviveNote(obj: any) { return new Note(obj); }
