import { For } from "solid-js";
import { characters } from "../../stores";
import { TimelineItem, TimelineItemProps } from "./TimelineItem";
import { A } from "@solidjs/router";
import TimelineItemEditor from "../ItemEditor";

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
                            <For each={Object.values(characters)}>
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
        return <article>
            <h4>
                <TimelineItemEditor id={this.id} path="title" store="characters" />
            </h4>
        </article>;
    }
}

