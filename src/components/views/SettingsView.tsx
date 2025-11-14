import Settings from "../Settings";

export default function SettingsView() {
    return (
        <div class="active page">
            <header>
                <h2>Settings</h2>
            </header>

            <article class="responsive">
                <Settings />
            </article>
        </div>
    );
}
