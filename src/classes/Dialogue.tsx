import { JSX } from "solid-js/jsx-runtime";
import { BaseItem, type BaseItemProps } from "./BaseItem";

export type DialoguePropsType = BaseItemProps<'dialogue'> & {
    characterId: string;
    text: string;
}

export class Dialogue extends BaseItem<DialoguePropsType> {
    render(): JSX.Element {
        return <div class={this.props.type}>
            <img src={`characters/${this.props.characterId}.png`} />
            {this.props.characterId}: {this.props.text}
        </div>;
    }

}
