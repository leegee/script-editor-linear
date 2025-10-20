import './index.css';
import "beercss";
import { render } from 'solid-js/web';
import { HashRouter, Route } from "@solidjs/router";
import 'solid-devtools';
import App from './App';
import Default from './components/panels/Default';
import NewTimelineItemSelector from './components/NewTimelineItemSelector';
import TimelineItemView from './components/views/TimelineItemView';
import CharacterView from './components/views/CharacterView';
import LocationView from './components/views/LocationView';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(
  () => <HashRouter root={App}>
    <Route path="/" component={Default} />
    <Route path="/new/:pos" component={NewTimelineItemSelector} />
    <Route path="/item/:id" component={TimelineItemView} />
    <Route path="/character/:id" component={CharacterView} />
    <Route path="/location/:id" component={LocationView} />
  </HashRouter>,
  root!
);
