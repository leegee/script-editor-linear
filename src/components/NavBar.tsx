import { A } from "@solidjs/router";

export default function Navbar() {
    return (
        <nav class="bottom" style="height: 5em">
            <A href="/"><i class="small">list_alt</i></A>
            <A href="/timeline"><i class="small">view_timeline</i></A>
            <A href="/settings"><i class="small">settings</i></A>
        </nav>
    );
}