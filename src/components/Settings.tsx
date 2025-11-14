import { settings } from "../stores/settings";
import { updateSetting } from "../stores/settings";

export default function Settings() {
    const handleChange = (ev: Event, fieldName: string) => updateSetting(fieldName, (ev.target as HTMLInputElement).checked);

    return (
        <div class="field">
            <label class="switch">
                <input type="checkbox"
                    checked={settings.noteChipsAsPics}
                    onInput={(e) => handleChange(e, 'noteChipsAsPics')}
                />
                <span class="left-padding">Show notes as pictures when a URL has been added</span>
            </label>
        </div>
    );
}
