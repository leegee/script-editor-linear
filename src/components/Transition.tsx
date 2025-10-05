import Component, { type ItemPropsType, Override } from './ScriptItem';

export type TransitionTypes = 'transition_fade' | 'transition_chop' | 'transition_dissolve'
    | 'transition_push' | 'transition_slide' | 'masked_transitions' | 'mastked_transitions_add' | 'animation';

export type TransitionPropsType = Override<ItemPropsType, {
    style?: TransitionTypes,
}>;

export const DefaultItem: TransitionPropsType = {
    type: 'Transition',
    class: 'Transition',
    icon: 'transition_fade',
    name: 'Transition',
    as: 'h6',
};

const component = (props: TransitionPropsType) => Component({ ...DefaultItem, ...props });

export default component;
export const Transition = component;
