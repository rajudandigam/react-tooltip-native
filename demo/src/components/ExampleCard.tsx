import React from "react";

type ExampleCardProps = {
  title: string;
  name: string;
  description?: string;
  children: React.ReactNode;
  code?: string;
};

export function ExampleCard({ title, name, description, children, code }: ExampleCardProps) {
  return (
    <div data-testid={`example-${name}`} className="example-card">
      <h3 className="example-card__title">{title}</h3>
      {description && <p className="example-card__description">{description}</p>}
      <div className="example-card__preview">{children}</div>
      {code && (
        <div className="example-card__code">
          <pre>
            <code>{code}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
