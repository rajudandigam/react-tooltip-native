import React from "react";
import type { LogEntry } from "../context/DemoContext";

type EventLogProps = {
  entries: LogEntry[];
  onClear: () => void;
  "data-testid"?: string;
};

export function EventLog({ entries, onClear, "data-testid": testId }: EventLogProps) {
  return (
    <div className="event-log" data-testid={testId ?? "event-log"}>
      <div className="event-log__header">
        <span className="event-log__title">Event log (open/close + reason)</span>
        <button type="button" className="event-log__clear" onClick={onClear}>
          Clear
        </button>
      </div>
      <ul className="event-log__list" aria-live="polite">
        {entries.length === 0 ? (
          <li className="event-log__empty">No events yet.</li>
        ) : (
          entries.slice(-20).map((e, i) => (
            <li key={`${e.at}-${i}`} className="event-log__entry">
              <span className="event-log__source">{e.source}</span>{" "}
              <span className="event-log__open">{e.open ? "open" : "close"}</span>{" "}
              <span className="event-log__reason">({e.reason})</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
