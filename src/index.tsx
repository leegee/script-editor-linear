// index.tsx
import "./index.css";
import "beercss";
import { render } from "solid-js/web";
import { HashRouter, Navigate, Route } from "@solidjs/router";

import ScriptLayout from "./layouts/ScriptLayout";
import TimelineLayout from "./layouts/TimelineLayout";
import MainLayout from "./layouts/MainLayout";
import NewTimelineItemSelector from "./components/NewTimelineItemSelector";
import Default from "./components/panels/Default";
import CharacterView from "./components/panels/CharacterView";
import LocationView from "./components/panels/LocationView";
import TimelineItemView from "./components/views/TimelineItemView";
import { loadAll } from "./stores";
import SettingsLayout from "./layouts/SettingsLayout";
import FiltersView from "./components/panels/FiltersView";
import FileMenuView from "./components/panels/FileMenuView";
import MenuView from "./components/panels/MenuView";
import NoteCreator from "./components/CoreItems/Notes/NoteCreator";
import NoteView from "./components/panels/NoteView";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error("Root element not found in index.html (check id='root').");
}

const commonRoutes = (
  <>
    <Route path="/" component={Default} />
    <Route path="/new/note/:itemId" component={NoteCreator} />
    <Route path="/new/:pos" component={NewTimelineItemSelector} />
    <Route path="/items/:id" component={TimelineItemView} />
    <Route path="/characters/:id" component={CharacterView} />
    <Route path="/characters" component={CharacterView} />
    <Route path="/locations/:id" component={LocationView} />
    <Route path="/locations" component={LocationView} />
    <Route path="/notes/:id" component={NoteView} />
    <Route path="/filters" component={FiltersView} />
  </>
);

await loadAll();

render(
  () => (
    <HashRouter root={MainLayout}>
      <Route path="/script" component={ScriptLayout}>
        {commonRoutes}
      </Route>

      <Route path="/timeline" component={TimelineLayout}>
        {commonRoutes}
      </Route>

      <Route path="/settings" component={SettingsLayout} />

      <Route path="/menu" component={MenuView} >
        <Route path="/file" component={FileMenuView} />
      </Route>

    </HashRouter>
  ),
  root!
);
