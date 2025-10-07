import { ActPropsType } from "./Act";
import { BaseItem, type BaseItemProps } from "./BaseItem";

export type ScenePropsType = BaseItemProps<'scene'>;

export class Scene extends BaseItem<ScenePropsType> { }

