import { For } from "solid-js";
import { timelineItemClasses } from "../lib/timelineItemRegistry";

export class FilterList {
    static ListFiltersHeader() {
        return (
            <header class="no-padding">
                <nav>
                    <h2 class="max"> Filters </h2>
                    <i>location_on</i>
                </nav>
            </header>
        )
    }

    static ListFilters() {
        return (
            <ul class="responsive scroll surface">
                <For each={Object.keys(timelineItemClasses)}>
                    {(item) => (
                        <label class="field checkbox">
                            <input type="checkbox" />
                            <span>{item}</span>
                        </label>
                    )}
                </For>
            </ul>
        )
    }
}