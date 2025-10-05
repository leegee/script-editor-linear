import { ScriptItem, type ItemPropsType } from "./ScriptItem";

export interface DialogueProps extends ItemPropsType {
    speaker?: string;
}

export class DialogueItem extends ScriptItem<DialogueProps> {
    type = "dialogue";
    class = "dialogue";
    icon = "chat";
    name = "dialogue";
    as = "h6";
    speaker = "Unknown";

    constructor(props: Partial<DialogueProps> = {}) {
        super(props);
    }
}

export default function Dialogue(props: DialogueProps) {
    const item = new DialogueItem(props);
    return item.render(props.children);
}
