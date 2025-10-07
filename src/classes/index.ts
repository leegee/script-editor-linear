import { type BaseItemProps } from './BaseItem';
import { type ActPropsType } from './Act';
import { type ScenePropsType } from './Scene';
import { type LocationPropsType } from './Location';
import { type DialoguePropsType } from './Dialogue';

export type AllClassPropsUnion = BaseItemProps
    | ActPropsType
    | ScenePropsType
    | LocationPropsType
    | DialoguePropsType;

