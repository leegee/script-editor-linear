import { createSignal } from "solid-js";

export default function SettingsView() {
    const [activeTab, setActiveTab] = createSignal("options");

    return (
        <div class="active page">
            <header>
                <h2>Settings</h2>
            </header>

            <article class="responsive">
                <p>Options go here…</p>
            </article>
        </div>
    );
}
