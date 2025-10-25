import { type JSX, createMemo, For } from "solid-js";
import { characters, removeCharacter, timelineItems } from "../../stores";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";
import { A } from "@solidjs/router";
import TimelineItemEditor from "../ItemEditor";
import { showAlert } from "../../stores/modals";

function isCharacterUsed(id: string) {
    return Object.values(timelineItems).some(
        item => item.type === "dialogue" && item.details.characterId === id
    );
}

export class CharacterItem extends TimelineItem {
    declare title: string;

    static revive(obj: any) {
        return new CharacterItem(obj);
    }

    static ListCharacters() {
        return (
            <article class="border">
                <div class="responsive scroll surface">
                    <table>
                        <thead class="fixed">
                            <tr>
                                <th class="no-border">
                                    <header class="no-padding">
                                        <nav>
                                            <h2 class="max"> Characters </h2>
                                            <i>people</i>
                                        </nav>
                                    </header>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <For each={Object.values(characters).sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()))}>
                                {(chr) => (
                                    <tr>
                                        <td>
                                            <A href={"/character/" + chr.id}>{chr.title}</A>
                                        </td>
                                    </tr>
                                )}
                            </For>
                        </tbody>
                    </table>
                </div>
            </article>
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
            <article class="border padding">
                <header>
                    <h4>
                        <TimelineItemEditor id={this.id} path="title" store="characters" />
                    </h4>
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
