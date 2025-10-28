import { For, createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { timelineItemClasses } from "../lib/timelineItemRegistry";
import { sectionMap } from "../stores/timelineViewModel";

const allTypes = Object.keys(timelineItemClasses);
const [filters, setFilters] = createStore(
    Object.fromEntries(allTypes.map((key) => [key, true]))
);

const styleElement = document.createElement("style");
styleElement.id = "filter-visibility-rules";
document.head.appendChild(styleElement);

const usedTypes = new Set(sectionMap.flatMap((s) => s.types));
const miscTypes = allTypes.filter((t) => !usedTypes.has(t));
const sectionsWithMisc = [
    ...sectionMap,
    ...(miscTypes.length ? [{ name: "Misc", types: miscTypes }] : []),
];

const toggleSection = (sectionTypes: string[]) => {
    const allOn = sectionTypes.every((t) => filters[t]);
    sectionTypes.forEach((t) => setFilters(t, !allOn));
};


export class FilterList {
    static ListFiltersHeader() {
        createEffect(() => {
            const dimmed = Object.entries(filters)
                .filter(([, visible]) => !visible)
                .map(([type]) => `.${type} { opacity: 50% !important; }`)
                .join("\n");

            styleElement.textContent = dimmed;
        });

        return (
            <header class="no-padding">
                <nav>
                    <h2 class="max">Filters</h2>
                    <i>filter_alt</i>
                </nav>
            </header>
        );
    }

    static ListFilters() {
        return (
            <ul class="responsive scroll surface">
                <For each={sectionsWithMisc}>
                    {(section) => {
                        const allOn = () => section.types.every((t) => filters[t]);
                        const someOn = () =>
                            section.types.some((t) => filters[t]) && !allOn();

                        return (
                            <li class="no-padding no-margin">
                                <label class="field checkbox no-padding no-margin">
                                    <input type="checkbox"
                                        checked={allOn()}
                                        ref={(el) => (el.indeterminate = someOn())}
                                        onInput={() => toggleSection(section.types)}
                                        title={`Toggle all ${section.name}`}
                                        class="right-margin tiny-margin"
                                    />
                                    <span>
                                        {section.name}
                                    </span>
                                </label>

                                <ul>
                                    <For each={section.types}>
                                        {(item) => (
                                            <label class="field checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={filters[item]}
                                                    onInput={(e) =>
                                                        setFilters(item, e.currentTarget.checked)
                                                    }
                                                />
                                                <span>{item}</span>
                                            </label>
                                        )}
                                    </For>
                                </ul>
                            </li>
                        );
                    }}
                </For>
            </ul>
        );
    }
}
