import { JSX } from "solid-js/jsx-runtime";
import { type ScriptItemProps } from "../lib/idbScriptStorage";
import { BaseScriptItem, type BaseScriptItemProps } from "./ScriptItem";

export interface DialoguePropsType extends BaseScriptItemProps {
    characterId: string;
}
export class Dialogue extends BaseScriptItem {
    render(): JSX.Element {
        return <div class={this.props.type}>
            <img src={`characters/${this.props.characterId}.png`} />
            {this.props.characterId}: {this.props.text}
        </div>;
    }

}
