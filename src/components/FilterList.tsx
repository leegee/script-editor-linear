import { For, createEffect, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { timelineItemClasses } from "../lib/timelineItemRegistry";
import { sectionMap } from "../stores/timelineViewModel";
import PanelSectionHeader from "./PanelSectionHeader";

const allTypes = Object.keys(timelineItemClasses);

export const [filters, setFilters] = createStore(
    Object.fromEntries(allTypes.map((key) => [key, true]))
);

export const filtersActiveCount = () => {
    const values = Object.values(filters);
    const active = values.filter(Boolean).length;
    const inactive = values.length - active;
    return inactive;
};

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
    static ListFilters() {
        const [hide, setHide] = createSignal(false);

        createEffect(() => {
            const effect = hide() ? 'display: none !important' : 'opacity: 50% !important';
            const dimmed = Object.entries(filters)
                .filter(([, visible]) => !visible)
                .map(([type]) => `.${type} { ${effect} }`)
                .join("\n");

            styleElement.textContent = dimmed;
        });

        const allOn = () => Object.values(filters).every(Boolean);
        const someOn = () =>
            Object.values(filters).some(Boolean) && !allOn();

        return (
            <nav class="wrap vertical responsive scroll surface">
                <div class="no-padding no-margin bottom-margin large-margin">
                    <div class="row">
                        <label class="checkbox large small-opacity no-padding small-margin ">
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

                        <span class="max" />

                        <div class="field middle-align right">
                            <nav>
                                <div class="max">
                                    <div>Hide filtered</div>
                                </div>
                                <label class="switch icon">
                                    <input
                                        type="checkbox"
                                        checked={hide()}
                                        onInput={(e) => setHide(e.currentTarget.checked)}
                                        title="Hide not dim"
                                    />
                                    <span>
                                        <i>visibility_off</i>
                                    </span>
                                </label>
                            </nav>
                        </div>

                        {/* <label class="right switch icon large no-padding small-margin bottom-margin">
                            <input
                                type="checkbox"
                                checked={hide()}
                                onInput={(e) => setHide(e.currentTarget.checked)}
                                title="Hide not dim"
                            />
                            <span><i>timer</i></span>

                            <span class="left-padding small-padding">Hide filtered</span>
                        </label> */}
                    </div>

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
