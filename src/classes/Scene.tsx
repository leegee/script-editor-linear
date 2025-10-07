import { ActPropsType } from "./Act";
import { BaseScriptItem, type BaseScriptItemProps } from "./ScriptItem";

export type ScenePropsType = BaseScriptItemProps<'scene'>;

export class Scene extends BaseScriptItem<ScenePropsType> { }

