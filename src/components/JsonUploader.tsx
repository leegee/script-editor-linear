import { A, useNavigate } from "@solidjs/router";
import { ingest } from "../lib/io";
import { showAlert, showConfirm } from "../stores/modals";

export default function JSONUploader() {
    const navigate = useNavigate();
    let fileInput: HTMLInputElement | undefined;

    const handleFileChange = async (e: Event) => {
        const file = (e.currentTarget as HTMLInputElement).files?.[0];
        if (!file) return;

        if (file.type !== "application/json" && !file.name.endsWith(".json")) {
            showAlert("Please select a JSON file");
            return;
        }

        try {
            console.log('Shall parse upload file')
            const text = await file.text();
            const data = JSON.parse(text);
            console.log("Parsed JSON:", data);
            await ingest(data.script, data.characters, data.locations, data.tags, data.notes);
            // TODO Pass this in an onCompete prop
            navigate('/script/');
        } catch (err) {
            console.error("Error reading or parsing JSON file:", err);
            showAlert("Invalid JSON file");
        }
    };

    async function openFilePicker() {
        if (await showConfirm("This will over-write your script.")) {
            fileInput?.click();
        }
    };

    return (
        <>
            <input
                type="file"
                accept=".json"
                ref={fileInput}
                onChange={handleFileChange}
                style={{ display: "none" }}
            />
            <A
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    openFilePicker();
                }}
            >
                Load script
            </A>
        </>
    );
}
