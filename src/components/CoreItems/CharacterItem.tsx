import { type JSX, createMemo, For } from "solid-js";
import { characters, removeCharacter, timelineItems } from "../../stores";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";
import { A } from "@solidjs/router";
import TimelineItemEditor from "../TimelineItemEditor";
import { showAlert } from "../../stores/modals";
import { childRoute } from "../../lib/routeResolver";
import PanelSectionHeader from "../PanelSectionHeader";

function isCharacterUsed(id: string) {
    return Object.values(timelineItems).some(
        item => item.type === "dialogue" && item.details.ref === id
    );
}

export class CharacterItem extends TimelineItem {
    declare title: string;

    static revive(obj: any) {
        return new CharacterItem(obj);
    }

    static ListCharactersHeaeder() {
        return <PanelSectionHeader title='Characters' icon='people' />
    }

    static ListCharacters() {
        return (
            <ul class="responsive scroll surface">
                <For each={Object.values(characters).sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()))}>
                    {(chr) => (
                        <li>
                            <A href={childRoute("characters/" + chr.id)}>{chr.title}</A>
                        </li>
                    )}
                </For>
            </ul>
        );
    }

    constructor(props: Omit<TimelineItemProps, "type">) {
        super({
            ...props,
            type: 'character'
        });
    }

    renderCompact() { return this.title; }

    renderFull() {
        return (
            <article>
                <header class="bottom-padding">
                    <h3 class="bottom-padding">
                        <TimelineItemEditor id={this.id} path="title" store="characters" />
                    </h3>
                </header>

                <div class="border padding">
                    <p>
                        If this character is not referenced in the script, it may be deleted.
                        Deletion is not reversible.
                    </p>
                    <button
                        class="chip"
                        onclick={() => this.delete()}
                        disabled={!!isCharacterUsed(this.id)}
                    >
                        <i>home</i>
                        <span>Delete this character</span>
                    </button>
                </div>
            </article>
        );
    }

    async delete() {
        if (isCharacterUsed(this.id)) {
            showAlert("Cannot delete this character: it is referenced in the script.");
            return;
        }

        await removeCharacter(this.id)
    }
}
