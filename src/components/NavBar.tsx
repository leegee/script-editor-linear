import { A } from "@solidjs/router";

export default function Navbar() {
    return (
        <nav class="bottom" style="height: 5em">
            <A href="/"><i>list_alt</i></A>
            <A href="/timeline"><i>view_timeline</i></A>
            <A href="/settings"><i>settings</i></A>
        </nav>
    );
}