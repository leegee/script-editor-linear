import { useNavigate } from "@solidjs/router";
import DragDropList from "../DragDropList/";
import { timelineItems, timelineSequence, reorderTimeline } from "../../stores/timelineItems";

export default function ScriptView() {
    const navigate = useNavigate();

    const items = () => timelineSequence().map(id => timelineItems[id]).filter(Boolean);

    return (
        <DragDropList
            items={items}
            showItem={(item) => navigate(`/script/items/${item.id}`)}
            onInsert={(pos: number) => navigate(`/script/new/${pos}`)}
            onReorder={(newOrder) => {
                const seq = timelineSequence();
                const newSeq = newOrder.map(i => seq[i]);
                reorderTimeline(newSeq);
            }}
        />
    );
}
