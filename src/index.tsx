import './index.css';
import "beercss";
import { render } from 'solid-js/web';
import App from './App';
import { HashRouter, Route } from '@solidjs/router';
import TwoPanelLayout from './components/layouts/TwoPanelLayout';
import NewTimelineItemSelector from './components/NewTimelineItemSelector';
import Default from './components/panels/Default';
import CharacterView from './components/views/CharacterView';
import LocationView from './components/views/LocationView';
import SettingsView from './components/views/SettingsView';
import TimelineItemView from './components/views/TimelineItemView';
import OnePanelLayout from './components/layouts/OnePanelLayout';
import TimelineView from './components/views/TimelineView';
import Navbar from './components/NavBar';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(() => (
  <HashRouter root={App}>
    <Route path="/" component={TwoPanelLayout} >
      <Route path="/" component={Default} />
      <Route path="/new/:pos" component={NewTimelineItemSelector} />
      <Route path="/item/:id" component={TimelineItemView} />
      <Route path="/character/:id" component={CharacterView} />
      <Route path="/location/:id" component={LocationView} />
      <Route path="/settings" component={SettingsView} />
    </Route>

    <Route path="/timeline" component={OnePanelLayout}>
      <Route path="/" component={TimelineView} />
    </Route>
  </HashRouter>

), root!);
