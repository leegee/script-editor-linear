import { createSignal } from "solid-js";
import { ingest } from "../lib/io";

export default function JSONUploader() {
    let fileInput: HTMLInputElement | undefined;

    const handleFileChange = async (e: Event) => {
        const file = (e.currentTarget as HTMLInputElement).files?.[0];
        if (!file) return;

        if (file.type !== "application/json" && !file.name.endsWith(".json")) {
            alert("Please select a JSON file");
            return;
        }

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            console.log("Parsed JSON:", data);
            await ingest(data.script, data.characters, data.locations);
        } catch (err) {
            console.error("Error reading or parsing JSON file:", err);
            alert("Invalid JSON file");
        }
    };

    const openFilePicker = () => fileInput?.click();

    return (
        <div>
            <input
                type="file"
                accept=".json"
                ref={fileInput}
                onChange={handleFileChange}
                style={{ display: "none" }}
            />
            <button class="transparent no-padding no-margin" onClick={openFilePicker}>
                Load script
            </button>
        </div>
    );
}
