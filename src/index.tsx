// index.tsx
import { render } from 'solid-js/web';
import 'solid-devtools';
import "beercss";
import './index.css';

import App from './App';
import { ingest } from './scripts/TheThreeBears';
import { loadAll } from './stores/coreStores';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

ingest()
  .catch(console.error)
  .then(() => loadAll())
  .then(() => render(() => <App />, root!));