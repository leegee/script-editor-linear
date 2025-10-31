import { A } from "@solidjs/router";

interface NavBarProps {
    root: string;
}

export default function Navbar(props: NavBarProps) {
    return (
        <nav class="toolbar center small-margin bottom-margin">
            <button class="transparent no-border tiny-padding">
                <A class="transparent " href={`${props.root}/locations`}><i class="large small-opacity">location_on</i></A>
                <div class="tooltip left">All Locations</div>
            </button>
            <button class="transparent no-border tiny-padding">
                <A class="transparent " href={`${props.root}/characters`}><i class="large small-opacity">people</i></A>
                <div class="tooltip left">All Characters</div>
            </button>
            <button class="transparent no-border tiny-padding">
                <A class="transparent " href={`${props.root}/filters`}><i class="large small-opacity">filter_alt</i></A>
                <div class="tooltip right">Filters</div>
            </button>
        </nav>
    );
}