import { Show } from "solid-js";
import { alertState, confirmState, closeConfirm } from "../../stores/modals";

export default function AlertConfirm() {
    return (
        <>
            <Show when={alertState()}>
                <div class="overlay blur active"></div>
                <dialog class="active">
                    <header>
                        <h5>{alertState()!.message}</h5>
                    </header>
                    <nav class="right-align">
                        <button class="primary" onClick={() => closeConfirm(true)}>OK</button>
                    </nav>
                </dialog>
            </Show>

            <Show when={confirmState()}>
                <div class="overlay blur active"></div>
                <dialog class="active">
                    <header>
                        <h5>{confirmState()!.message}</h5>
                    </header>
                    <nav class="right-align">
                        <button class="transparent" onClick={() => closeConfirm(false)}>Cancel</button>
                        <button class="primary" onClick={() => closeConfirm(true)}>OK</button>
                    </nav>
                </dialog>
            </Show>
        </>
    );
}
