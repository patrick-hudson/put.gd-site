import type { ReactNode } from "react";

export interface SectionHeadingHeaderComponentProperties {
  readonly sectionHeadingIdentifier: string;
  readonly sectionHeadingText: string;
  readonly children: ReactNode;
}

export function SectionHeadingHeaderComponent(sectionHeadingHeaderComponentProperties: SectionHeadingHeaderComponentProperties) {
  return (
    <header className="section-head">
      <h2 id={sectionHeadingHeaderComponentProperties.sectionHeadingIdentifier}>
        {sectionHeadingHeaderComponentProperties.sectionHeadingText}
      </h2>
      {sectionHeadingHeaderComponentProperties.children}
    </header>
  );
}
