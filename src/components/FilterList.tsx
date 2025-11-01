import { For, createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { timelineItemClasses } from "../lib/timelineItemRegistry";
import { sectionMap } from "../stores/timelineViewModel";
import PanelSectionHeader from "./PanelSectionHeader";

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

const toggleAll = () => {
    const allOn = Object.values(filters).every(Boolean);
    Object.keys(filters).forEach((t) => setFilters(t, !allOn));
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
            <PanelSectionHeader title="Filters" icon="filter_alt" />
        );
    }

    static ListFilters() {
        const allOn = () => Object.values(filters).every(Boolean);
        const someOn = () =>
            Object.values(filters).some(Boolean) && !allOn();

        return (
            <nav class="wrap vertical responsive scroll surface">
                <div class="no-padding no-margin bottom-margin large-margin">
                    <label class="field checkbox large small-opacity no-padding small-margin bottom-margin">
                        <input
                            type="checkbox"
                            checked={allOn()}
                            ref={(el) => (el.indeterminate = someOn())}
                            onInput={() => toggleAll()}
                            title="Toggle all filters"
                            class="tiny-margin"
                        />
                        <span>All Filters</span>
                    </label>

                    <For each={sectionsWithMisc}>
                        {(section) => {
                            const allOn = () => section.types.every((t) => filters[t]);
                            const someOn = () =>
                                section.types.some((t) => filters[t]) && !allOn();

                            return (
                                <div class="no-padding bottom-margin left-margin large-margin">
                                    <label class="field checkbox no-padding no-margin">
                                        <input
                                            type="checkbox"
                                            checked={allOn()}
                                            ref={(el) => (el.indeterminate = someOn())}
                                            onInput={() => toggleSection(section.types)}
                                            title={`Toggle all ${section.name}`}
                                            class="tiny-margin"
                                        />
                                        <span>{section.name}</span>
                                    </label>

                                    <nav class="no-margin no-padding left-margin large-margin">
                                        <For each={section.types}>
                                            {(item) => (
                                                <label class="field checkbox small">
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
                                    </nav>
                                </div>
                            );
                        }}
                    </For>

                </div>
            </nav>
        );
    }
}
