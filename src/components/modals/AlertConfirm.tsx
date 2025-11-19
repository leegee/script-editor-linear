import { Show, createEffect, onMount, onCleanup } from "solid-js";
import { alertState, confirmState, closeConfirm, closeAlert } from "../../stores/modals";

export default function AlertConfirm() {
    let alertOkBtn!: HTMLButtonElement;
    let confirmCancelBtn!: HTMLButtonElement;
    let confirmOkBtn!: HTMLButtonElement;

    const handleKey = (e: KeyboardEvent) => {
        const alert = alertState();
        const confirm = confirmState();

        // Nothing open? No handler.
        if (!alert && !confirm) return;

        const isConfirm = !!confirm;

        switch (e.key) {
            case "Escape":
                e.preventDefault();
                if (isConfirm) closeConfirm(false);
                else closeAlert();
                break;

            case "Enter":
            case " ":
                e.preventDefault();
                (document.activeElement as HTMLElement)?.click();
                break;

            case "ArrowLeft":
            case "ArrowRight":
                if (isConfirm) {
                    e.preventDefault();
                    const active = document.activeElement;
                    if (active === confirmCancelBtn) confirmOkBtn.focus();
                    else confirmCancelBtn.focus();
                }
                break;
        }
    };

    // Attach/remove keyboard listener only while dialog is open:
    createEffect(() => {
        const isOpen = !!alertState() || !!confirmState();
        if (!isOpen) return;

        window.addEventListener("keydown", handleKey);
        onCleanup(() => window.removeEventListener("keydown", handleKey));
    });

    // Focus default buttons on mount of each dialog
    createEffect(() => {
        if (alertState()) {
            queueMicrotask(() => alertOkBtn?.focus());
        }
    });

    createEffect(() => {
        if (confirmState()) {
            queueMicrotask(() => confirmOkBtn?.focus());
        }
    });

    return (
        <>
            <Show when={alertState()}>
                <div class="overlay blur active" style="z-index: 9999"></div>
                <dialog class="active" style="z-index: 10000">
                    {alertState()!.message}
                    <nav class="right-align">
                        <button
                            class="primary"
                            ref={alertOkBtn}
                            onClick={() => closeAlert()}
                        >
                            OK
                        </button>
                    </nav>
                </dialog>
            </Show>

            <Show when={confirmState()}>
                <div class="overlay blur active" style="z-index: 9999"></div>
                <dialog class="active" style="z-index: 10000">
                    <div>{confirmState()!.message}</div>
                    <nav class="right-align">
                        <button
                            class="transparent"
                            ref={confirmCancelBtn}
                            onClick={() => closeConfirm(false)}
                        >
                            Cancel
                        </button>
                        <button
                            class="primary"
                            ref={confirmOkBtn}
                            onClick={() => closeConfirm(true)}
                        >
                            OK
                        </button>
                    </nav>
                </dialog>
            </Show>
        </>
    );
}
