import type { NavigationLink } from "../../../model/NavigationLink";

export interface NavigationLinkListComponentProperties {
  readonly navigationAccessibleLabel: string;
  readonly navigationLinks: readonly NavigationLink[];
}

export function NavigationLinkListComponent(navigationLinkListComponentProperties: NavigationLinkListComponentProperties) {
  return (
    <nav aria-label={navigationLinkListComponentProperties.navigationAccessibleLabel}>
      {navigationLinkListComponentProperties.navigationLinks.map((navigationLink) => (
        <a key={navigationLink.navigationLinkLabel} href={navigationLink.navigationLinkHref}>
          {navigationLink.navigationLinkLabel}
        </a>
      ))}
    </nav>
  );
}
