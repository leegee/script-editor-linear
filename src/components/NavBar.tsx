import { A } from "@solidjs/router";

interface NavBarProps {
    root: string;
}

export default function Navbar(props: NavBarProps) {
    return (
        <nav class="top">
            <A class="round small transparent border" href={`${props.root}/locations`}><i class="small">location_on</i></A>
            <A class="round small transparent border" href={`${props.root}/characters`}><i class="small">people</i></A>
            <A class="round small transparent border" href={`${props.root}/filters`}><i class="small">filter_alt</i></A>
        </nav>
    );
}