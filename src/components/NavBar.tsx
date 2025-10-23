import { A } from "@solidjs/router";

export default function Navbar() {
    return (
        <nav class="bottom small-padding">
            <A class="round small transparent border" href="/"><i class="small">list_alt</i></A>
            <A class="round small transparent border" href="/timeline"><i class="small">view_timeline</i></A>
            <A class="round small transparent border" href="/settings"><i class="small">settings</i></A>
        </nav>
    );
}