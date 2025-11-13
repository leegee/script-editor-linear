interface PanelSectionHeaderProps {
    title: string;
    icon?: string;
    badge?: number | string;
}

export default function PanelSectionHeader(props: PanelSectionHeaderProps) {
    return (
        <header class="no-padding">
            <nav class="no-space">
                <h3 class="max" style="text-transform:capitalize">{props.title}</h3>

                {props.icon && (
                    <a>
                        <i>{props.icon}</i>
                        {props.badge && <div class="badge border">{props.badge}</div>}
                    </a>
                )}
            </nav>
        </header>
    );
}
