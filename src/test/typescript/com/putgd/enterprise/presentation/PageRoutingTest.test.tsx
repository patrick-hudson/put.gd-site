import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderEnterpriseApplication } from "../support/EnterpriseTestApplicationContextFactory";

describe("page routing", () => {
  it.each(["/", "/index.html"])("renders the landing page at %s with its sections in the configured order", (requestedPathname) => {
    window.history.replaceState(null, "", requestedPathname);
    renderEnterpriseApplication();
    expect(Array.from(document.querySelectorAll("main > section")).map((sectionElement) => sectionElement.className)).toEqual([
      "hero",
      "pipeline",
      "script",
      "install",
      "details",
    ]);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Anything you capture or copy, uploaded to storage you control.",
    );
  });

  it("renders the not found page anywhere else", () => {
    window.history.replaceState(null, "", "/dl/stable/windows");
    renderEnterpriseApplication();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("There is nothing at this address.");
    expect(screen.getByRole("link", { name: "install section" })).toHaveAttribute("href", "/#install");
    expect(screen.getByRole("link", { name: "releases page" })).toHaveAttribute(
      "href",
      "https://github.com/patrick-hudson/put.gd-desktop/releases",
    );
    expect(document.title).toBe("Not found, put.gd");
    expect(document.querySelector("main > section")).not.toBeInTheDocument();
  });

  it("links the skip link to main content", () => {
    renderEnterpriseApplication();
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#main");
    expect(document.getElementById("main")?.tagName).toBe("MAIN");
  });
});
