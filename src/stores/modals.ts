import { createSignal, type JSX } from "solid-js";

type AlertState = { message: string | JSX.Element; resolve?: () => void } | null;
type ConfirmState = { message: string | JSX.Element; resolve: (value: boolean) => void } | null;

export const [alertState, setAlertState] = createSignal<AlertState>(null);
export const [confirmState, setConfirmState] = createSignal<ConfirmState>(null);

export function showAlert(message: string | JSX.Element) {
    return new Promise<void>((resolve) => {
        setAlertState({ message, resolve });
    });
}

export function closeAlert() {
    const state = alertState();
    state?.resolve?.();
    setAlertState(null);
}

export function showConfirm(message: string | JSX.Element) {
    return new Promise<boolean>((resolve) => {
        setConfirmState({ message, resolve });
    });
}

export function closeConfirm(value: boolean) {
    const state = confirmState();
    state?.resolve(value);
    setConfirmState(null);
}
