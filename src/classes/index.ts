import { type BaseScriptItemProps } from './ScriptItem';
import { type ActPropsType } from './Act';
import { type ScenePropsType } from './Scene';
import { type LocationPropsType } from './Location';
import { type DialoguePropsType } from './Dialogue';

export type AllClassPropsUnion = BaseScriptItemProps
    | ActPropsType
    | ScenePropsType
    | LocationPropsType
    | DialoguePropsType;

