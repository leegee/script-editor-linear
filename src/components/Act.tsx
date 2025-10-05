import Component, { type ItemPropsType, Override } from './ScriptItem';

// Act props: inherit from ItemPropsType, override 'type' and add optional fields
export type ActPropsType = Override<ItemPropsType, {
    summary?: string;
}>;

export const DefaultItem: ActPropsType = {
    type: 'act',
    class: 'act',
    icon: 'comedy_mask',
    name: 'act',
    as: 'h2',
};

const component = (props: ActPropsType) => Component({ ...DefaultItem, ...props });

export default component;
export const Act = component;
