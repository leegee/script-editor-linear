// index.tsx
import "./index.css";
import "beercss";
import { render } from "solid-js/web";
import { HashRouter, Route } from "@solidjs/router";

// Views
import Default from "./components/panels/Default";
import NewTimelineItemSelector from "./components/NewTimelineItemSelector";
import TimelineItemView from "./components/views/TimelineItemView";
import CharacterView from "./components/views/CharacterView";
import LocationView from "./components/views/LocationView";
import SettingsView from "./components/views/SettingsView";

// Layouts
import MainLayout from "./layouts/MainLayout";
import OnePanelLayout from "./layouts/OnePanelLayout";
import TwoPanelLayout from "./layouts/TwoPanelLayout";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error("Root element not found in index.html (check id='root').");
}

const commonRoutes = (
  <>
    <Route path="/" component={Default} />
    <Route path="/new/:pos" component={NewTimelineItemSelector} />
    <Route path="/item/:id" component={TimelineItemView} />
    <Route path="/character/:id" component={CharacterView} />
    <Route path="/location/:id" component={LocationView} />
    <Route path="/settings" component={SettingsView} />
  </>
);

render(
  () => (
    <HashRouter root={MainLayout}>
      <Route path="/" component={TwoPanelLayout}>
        {commonRoutes}
      </Route>

      <Route path="/timeline" component={OnePanelLayout}>
        {commonRoutes}
      </Route>
    </HashRouter>
  ),
  root!
);
