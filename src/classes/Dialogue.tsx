import { JSX } from "solid-js/jsx-runtime";
import { BaseScriptItem, type BaseScriptItemProps } from "./ScriptItem";

export type DialoguePropsType = BaseScriptItemProps<'dialogue'> & {
    characterId: string;
    text: string;
}

export class Dialogue extends BaseScriptItem<DialoguePropsType> {
    render(): JSX.Element {
        return <div class={this.props.type}>
            <img src={`characters/${this.props.characterId}.png`} />
            {this.props.characterId}: {this.props.text}
        </div>;
    }

}
