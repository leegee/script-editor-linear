import { For } from "solid-js";
import { timelineItemClasses } from "../lib/timelineItemRegistry";

export default function FilterList() {
    return (
        <article class="border">
            <div class="responsive scroll surface">

                <header class="no-padding">
                    <nav>
                        <h2 class="max"> Filters </h2>
                        <i>location_on</i>
                    </nav>
                </header>

                <For each={Object.keys(timelineItemClasses)}>
                    {(item) => (
                        <label class="field checkbox">
                            <input type="checkbox" />
                            <span>{item}</span>
                        </label>
                    )}
                </For>

            </div>
        </article>
    )
}