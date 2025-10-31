interface PanelSectionHeaderProps {
    title: string;
    icon?: string;
}

export default function PanelSectionHeader(props: PanelSectionHeaderProps) {
    return (
        <header class="no-padding">
            <nav class="no-space">
                <h3 class="max"> {props.title} </h3>
                {props.icon && (<i>{props.icon}</i>)}
            </nav>
        </header>
    );
}