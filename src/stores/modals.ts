import { createSignal } from "solid-js";

type AlertState = { message: string; resolve?: () => void } | null;
type ConfirmState = { message: string; resolve: (value: boolean) => void } | null;

export const [alertState, setAlertState] = createSignal<AlertState>(null);
export const [confirmState, setConfirmState] = createSignal<ConfirmState>(null);

export function showAlert(message: string) {
    return new Promise<void>((resolve) => {
        setAlertState({ message, resolve });
    });
}

export function showConfirm(message: string) {
    return new Promise<boolean>((resolve) => {
        setConfirmState({ message, resolve });
    });
}

export function closeConfirm(value: boolean) {
    const state = confirmState();
    state?.resolve(value);
    setConfirmState(null);
}
