
import DragDropList from './components/DragDropList';
import Component from './components/ScriptItem';
import Act from './components/Act';
import Scene from './components/Scene';
import Dialogue from './components/Dialogue';
import Transition from './components/Transition';
import Location from './components/Location';

export default function App() {
    return <main>
        <DragDropList>
            <Act>Act Apple
                <Location name="Home" lat={53} lng={0} />
            </Act>
            <Scene> Scene Banana</Scene>
            <Dialogue>Dialogue Orange</Dialogue>
            <Component>Item Grapes</Component>
            <Transition style="transition_fade">Fade to black</Transition>
        </DragDropList>
    </main>
}
