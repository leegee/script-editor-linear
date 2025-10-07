import { LocationPropsType } from "./Location";
import { BaseScriptItem, type BaseScriptItemProps } from "./ScriptItem";

export type ActPropsType = BaseScriptItemProps<'act'>;

export class Act extends BaseScriptItem<ActPropsType> { }


