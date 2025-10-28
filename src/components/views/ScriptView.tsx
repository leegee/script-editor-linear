import DragDropList from "../DragDropList/";
import { timelineItems, timelineSequence } from "../../stores/timelineItems";

export default function ScriptView() {

    const items = () => timelineSequence().map(id => timelineItems[id]).filter(Boolean);

    return (
        <DragDropList items={items} />
    );
}
