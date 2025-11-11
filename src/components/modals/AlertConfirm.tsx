import { Show } from "solid-js";
import { alertState, confirmState, closeConfirm, closeAlert } from "../../stores/modals";

export default function AlertConfirm() {
    return (
        <>
            <Show when={alertState()}>
                <div class="overlay blur active" style="z-index: 9999"></div>
                <dialog class="active" style="z-index: 10000">
                    {alertState()!.message}
                    <nav class="right-align">
                        <button class="primary" onClick={() => closeAlert()}>OK</button>
                    </nav>
                </dialog>
            </Show>

            <Show when={confirmState()}>
                <div class="overlay blur active" style="z-index: 9999"></div>
                <dialog class="active" style="z-index: 10000">
                    {confirmState()!.message}
                    <nav class="right-align">
                        <button class="transparent" onClick={() => closeConfirm(false)}>Cancel</button>
                        <button class="primary" onClick={() => closeConfirm(true)}>OK</button>
                    </nav>
                </dialog>
            </Show>
        </>
    );
}
