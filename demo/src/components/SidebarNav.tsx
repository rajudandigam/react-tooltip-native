import React from "react";

const SECTIONS = [
  { id: "tooltips-basic", label: "Tooltips" },
  { id: "popovers-basic", label: "Popovers" },
  { id: "fixtures-clipping", label: "Edge-case fixtures" },
  { id: "a11y", label: "Accessibility" },
] as const;

export function SidebarNav() {
  return (
    <nav className="sidebar-nav" aria-label="Demo sections">
      <ul className="sidebar-nav__list">
        {SECTIONS.map(({ id, label }) => (
          <li key={id} className="sidebar-nav__item">
            <a href={`#${id}`} className="sidebar-nav__link">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
