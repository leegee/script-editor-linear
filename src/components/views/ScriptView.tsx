import { useNavigate } from "@solidjs/router";
import DragDropList from "../DragDropList";
import { timelineItems, timelineSequence, reorderTimeline } from "../../stores/timelineItems";

export default function ScriptView() {
    const navigate = useNavigate();

    const items = () => timelineSequence().map(id => timelineItems[id]).filter(Boolean);

    return (
        <>
            <DragDropList
                items={items}
                showItem={(item) => navigate(`/item/${item.id}`)}
                onInsert={(pos: number) => navigate(`/new/${pos}`)}
                onReorder={(newOrder) => {
                    const seq = timelineSequence();
                    const newSeq = newOrder.map(i => seq[i]);
                    reorderTimeline(newSeq);
                }}
            />
        </>
    );
}
