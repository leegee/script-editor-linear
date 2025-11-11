// index.tsx
import "./index.css";
import "beercss";
import { render } from "solid-js/web";
import { HashRouter, Route } from "@solidjs/router";

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
import NoteCreator from "./components/panels/NoteCreator";
import TagCreator from "./components/panels/TagNewView";
import ViewEditNote from "./components/ViewEditNote";
import TypingLayout from "./layouts/TypingLayout";
import { ChildRouteProvider } from "./components/ChildRoute";
import TagsView from "./components/panels/TagsListView";
import ViewEditTag from "./components/ViewEditTag";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error("Root element not found in index.html (check id='root').");
}

const commonRoutes = (
  <>
    <Route path="/" component={Default} />
    <Route path="/attach-new/note/:itemId" component={NoteCreator} />
    <Route path="/attach-new/tag/:itemId" component={TagCreator} />
    <Route path="/new/:pos" component={NewTimelineItemSelector} />
    <Route path="/items/:id" component={TimelineItemView} />
    <Route path="/characters/:id" component={CharacterView} />
    <Route path="/characters" component={CharacterView} />
    <Route path="/locations/:id" component={LocationView} />
    <Route path="/locations" component={LocationView} />
    <Route path="/notes/:id" component={ViewEditNote} />
    <Route path="/tags" component={TagsView} />
    <Route path="/tags/:id" component={ViewEditTag} />
    <Route path="/filters" component={FiltersView} />
  </>
);

await loadAll();

render(
  () => (
    <ChildRouteProvider>
      <HashRouter root={MainLayout}>
        <Route path="/script" component={ScriptLayout}>
          {commonRoutes}
        </Route>

        <Route path="/timeline" component={TimelineLayout}>
          {commonRoutes}
        </Route>

        <Route path="/typing" component={TypingLayout} >
          {commonRoutes}
        </Route>

        <Route path="/settings" component={SettingsLayout} />
      </HashRouter>
    </ChildRouteProvider>

  ),
  root!
);
