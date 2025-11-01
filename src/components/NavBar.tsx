import { A } from "@solidjs/router";
import { childRoute } from "../lib/routeResolver";

export default function Navbar() {
    return (
        <nav class="toolbar center small-margin bottom-margin">
            <button class="transparent no-border tiny-padding">
                <A class="transparent " href={childRoute('locations')}><i class="large small-opacity">location_on</i></A>
                <div class="tooltip left">All Locations</div>
            </button>
            <button class="transparent no-border tiny-padding">
                <A class="transparent " href={childRoute('characters')}><i class="large small-opacity">people</i></A>
                <div class="tooltip left">All Characters</div>
            </button>
            <button class="transparent no-border tiny-padding">
                <A class="transparent " href={childRoute('filters')}><i class="large small-opacity">filter_alt</i></A>
                <div class="tooltip right">Filters</div>
            </button>
        </nav>
    );
}