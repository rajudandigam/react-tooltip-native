import React from "react";
import { createRoot } from "react-dom/client";
import { useEngine, RunEngine, runEngine } from "@lib/react";
import "./styles.css";

function HookDemo() {
  const { run, running, lastResult, reset } = useEngine();
  const [input, setInput] = React.useState("hello");

  return (
    <section aria-labelledby="hook-title">
      <h2 id="hook-title">useEngine hook</h2>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        aria-label="Input for engine"
      />
      <button
        type="button"
        onClick={() => run(input)}
        disabled={running}
        aria-busy={running}
      >
        {running ? "Running…" : "Run"}
      </button>
      <button type="button" onClick={reset}>
        Reset
      </button>
      {lastResult && (
        <p data-result role="status" aria-live="polite">
          {lastResult.success
            ? `Success (${lastResult.method})`
            : `Failed: ${lastResult.method}${lastResult.code ? ` — ${lastResult.code}` : ""}`}
        </p>
      )}
    </section>
  );
}

function ComponentDemo() {
  const [status, setStatus] = React.useState<string | null>(null);

  return (
    <section aria-labelledby="component-title">
      <h2 id="component-title">RunEngine component</h2>
      <RunEngine
        input="click me"
        onResult={(r) => setStatus(r.success ? `ok: ${r.method}` : `err: ${r.method}`)}
      >
        <button type="button" data-component-trigger>
          Run via component
        </button>
      </RunEngine>
      {status && (
        <p data-component-result role="status" aria-live="polite">
          {status}
        </p>
      )}
    </section>
  );
}

function ImperativeDemo() {
  const [msg, setMsg] = React.useState<string | null>(null);

  return (
    <section aria-labelledby="imperative-title">
      <h2 id="imperative-title">Imperative runEngine</h2>
      <button
        type="button"
        data-imperative-trigger
        onClick={async () => {
          const r = await runEngine("direct");
          setMsg(r.success ? `Success: ${r.method}` : `Failed: ${r.method}`);
        }}
      >
        Run imperative
      </button>
      {msg && (
        <p data-imperative-result role="status" aria-live="polite">
          {msg}
        </p>
      )}
    </section>
  );
}

function App() {
  return (
    <main>
      <h1>Template library demo</h1>
      <HookDemo />
      <ComponentDemo />
      <ImperativeDemo />
    </main>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
