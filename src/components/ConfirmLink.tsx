import { A, useNavigate } from "@solidjs/router";
import { showConfirm } from "../stores/modals";

interface ConfirmLinkProps {
    href: string;
    children: any;
    message: string;
    onConfirm?: () => void | Promise<void>;
}

export function ConfirmLink(props: ConfirmLinkProps) {
    const navigate = useNavigate();

    const handleClick = async (e: MouseEvent) => {
        e.preventDefault();
        const confirmed = await showConfirm(props.message);
        if (!confirmed) return;

        if (props.onConfirm) {
            await props.onConfirm();
        }

        navigate(props.href);
    };

    return (
        <A href={props.href} onClick={handleClick}>
            {props.children}
        </A>
    );
}
