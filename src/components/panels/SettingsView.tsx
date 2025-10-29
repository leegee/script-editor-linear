import { createSignal } from "solid-js";

export default function SettingsView() {
    const [activeTab, setActiveTab] = createSignal("options");

    return (
        <article>

            <header>
                <h2>Settings</h2>
            </header>

            <nav class="tabbed small medium-margin margin-bottom">
                <a
                    class={activeTab() === "options" ? "active" : ""}
                    onClick={() => setActiveTab("options")}
                >
                    <i>settings</i>
                    <span>Options</span>
                </a>
                <a
                    class={activeTab() === "help" ? "active" : ""}
                    onClick={() => setActiveTab("help")}
                >
                    <i>help</i>
                    <span>Help</span>
                </a>
            </nav>

            <div class={`page padding ${activeTab() === "options" ? "active" : ""}`}>
                <p>Options go here…</p>
            </div>

            <div class={`page padding ${activeTab() === "help" ? "active" : ""}`}>
                <p>Help information here…</p>
            </div>
        </article>
    );
}
