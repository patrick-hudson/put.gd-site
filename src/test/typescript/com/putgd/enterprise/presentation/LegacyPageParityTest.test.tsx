import { describe, expect, it } from "vitest";
import legacyIndexHtmlDocumentSource from "@putgd-enterprise-test-resources/fixtures/legacy-index.html?raw";
import { configureFakeBrowserEnvironment } from "../support/FakeBrowserEnvironment";
import { renderEnterpriseApplication } from "../support/EnterpriseTestApplicationContextFactory";

// The legacy page's markup is what JavaScript-free visitors saw, so render the Enterprise Edition
// in the matching state: reduced motion (console fully typed) and no release manifest.
function renderEnterpriseEditionInLegacyEquivalentState(): Element {
  configureFakeBrowserEnvironment({ isReducedMotionPreferred: true });
  return renderEnterpriseApplication().container;
}

function parseLegacyPageBody(): Element {
  return new DOMParser().parseFromString(legacyIndexHtmlDocumentSource, "text/html").body;
}

function removeIntentionallyDivergentNodes(pageRootElement: Element): Element {
  const comparablePageRootElement = pageRootElement.cloneNode(true) as Element;
  comparablePageRootElement.querySelector("#channel")?.replaceChildren();
  comparablePageRootElement.querySelector("#readout")?.replaceChildren();
  return comparablePageRootElement;
}

function describeElementSignature(element: Element): string {
  const sortedAttributeDescriptions = Array.from(element.attributes)
    .map((attribute) => `${attribute.name}=${JSON.stringify(attribute.value)}`)
    .sort();
  return `<${element.tagName.toLowerCase()} ${sortedAttributeDescriptions.join(" ")}>`;
}

function collectElementSignaturesInDocumentOrder(pageRootElement: Element): string[] {
  return Array.from(removeIntentionallyDivergentNodes(pageRootElement).querySelectorAll("*")).map(describeElementSignature);
}

// The legacy file has indentation newlines between elements, which JSX does not reproduce.
function collectNormalizedTextContent(pageRootElement: Element): string {
  const comparablePageRootElement = removeIntentionallyDivergentNodes(pageRootElement);
  comparablePageRootElement.normalize();
  const textNodeWalker = document.createTreeWalker(comparablePageRootElement, NodeFilter.SHOW_TEXT);
  const whitespaceOnlyTextNodes: Node[] = [];
  while (textNodeWalker.nextNode()) {
    if (textNodeWalker.currentNode.textContent?.trim() === "") {
      whitespaceOnlyTextNodes.push(textNodeWalker.currentNode);
    }
  }
  for (const whitespaceOnlyTextNode of whitespaceOnlyTextNodes) {
    whitespaceOnlyTextNode.parentNode?.removeChild(whitespaceOnlyTextNode);
  }
  return (comparablePageRootElement.textContent ?? "").split(/\s+/).filter(Boolean).join(" ");
}

describe("parity with the legacy hand-written index.html", () => {
  it("renders the same elements with the same attributes in the same order", () => {
    const legacyElementSignatures = collectElementSignaturesInDocumentOrder(parseLegacyPageBody());
    const enterpriseEditionElementSignatures = collectElementSignaturesInDocumentOrder(renderEnterpriseEditionInLegacyEquivalentState());
    expect(enterpriseEditionElementSignatures).toEqual(legacyElementSignatures);
  });

  it("renders the same words in the same order", () => {
    const legacyNormalizedTextContent = collectNormalizedTextContent(parseLegacyPageBody());
    const enterpriseEditionNormalizedTextContent = collectNormalizedTextContent(renderEnterpriseEditionInLegacyEquivalentState());
    expect(enterpriseEditionNormalizedTextContent).toBe(legacyNormalizedTextContent);
  });

  it("renders the hero terminal with the legacy whitespace preserved exactly", () => {
    const legacyTerminalText = parseLegacyPageBody().querySelector(".term-body")?.textContent;
    const enterpriseEditionTerminalText = renderEnterpriseEditionInLegacyEquivalentState().querySelector(".term-body")?.textContent;
    expect(enterpriseEditionTerminalText).toBe(legacyTerminalText);
    expect(enterpriseEditionTerminalText).toContain("tests/test_upload.py ....F.....   [ 13%]\n");
  });

  it("renders the scripting console with the legacy text exactly", () => {
    const legacyConsoleText = parseLegacyPageBody().querySelector("#console")?.textContent;
    expect(renderEnterpriseEditionInLegacyEquivalentState().querySelector("#console")?.textContent).toBe(legacyConsoleText);
  });
});
