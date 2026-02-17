import React from "react";

type SectionProps = {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function Section({ id, title, description, children }: SectionProps) {
  return (
    <section
      id={id}
      data-testid={`demo-section-${id}`}
      aria-labelledby={id ? `${id}-heading` : undefined}
      className="demo-section"
    >
      <h2 id={id ? `${id}-heading` : undefined} className="demo-section__title">
        {title}
      </h2>
      {description && <p className="demo-section__description">{description}</p>}
      {children}
    </section>
  );
}
