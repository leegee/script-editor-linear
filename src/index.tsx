// index.tsx
import { render } from 'solid-js/web';
import 'solid-devtools';
import "beercss";

import App from './App';
import { ingest } from './ingestTest';
import { memScriptStore } from "./stores/memScriptStore";
import { scriptStorage } from "./stores/idbScriptStore";
import { syncStores } from "./stores/syncStores";

syncStores(memScriptStore, scriptStorage);

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

ingest()
  .catch(
    console.error
  )
  .then(
    () => render(
      () => <App />,
      root!
    )
  );
