import { describe, expect, it } from "vitest";
import { UnresolvableExternalUrlKeyException } from "@putgd-enterprise/impl/exceptions/UnresolvableExternalUrlKeyException";
import { SingleCharacterRepeatingSequenceGeneratorImpl } from "@putgd-enterprise/impl/generators/SingleCharacterRepeatingSequenceGeneratorImpl";
import { EqualsSignDelimitedKeyValuePairExternalUrlResolverImpl } from "@putgd-enterprise/impl/resolvers/EqualsSignDelimitedKeyValuePairExternalUrlResolverImpl";
import { PrefixingAssetPathResolverImpl } from "@putgd-enterprise/impl/resolvers/PrefixingAssetPathResolverImpl";

describe("PrefixingAssetPathResolverImpl", () => {
  it("prefixes relative asset paths", () => {
    expect(new PrefixingAssetPathResolverImpl("/_site/").resolveAssetPath("shots/tray-trio.webp")).toBe("/_site/shots/tray-trio.webp");
  });
});

describe("EqualsSignDelimitedKeyValuePairExternalUrlResolverImpl", () => {
  const externalUrlResolver = new EqualsSignDelimitedKeyValuePairExternalUrlResolverImpl([
    "  SOURCE_REPOSITORY = https://github.com/patrick-hudson/put.gd-desktop  ",
    "SEARCH=https://example.invalid/search?q=put.gd&sort=new",
  ]);

  it("resolves a configured key and trims the whitespace XML leaves behind", () => {
    expect(externalUrlResolver.resolveExternalUrl("SOURCE_REPOSITORY")).toBe("https://github.com/patrick-hudson/put.gd-desktop");
  });

  it("splits on the first equals sign only, so query strings survive", () => {
    expect(externalUrlResolver.resolveExternalUrl("SEARCH")).toBe("https://example.invalid/search?q=put.gd&sort=new");
  });

  it("throws for a key that is not configured", () => {
    expect(() => externalUrlResolver.resolveExternalUrl("MISSING")).toThrow(UnresolvableExternalUrlKeyException);
  });
});

describe("SingleCharacterRepeatingSequenceGeneratorImpl", () => {
  it.each([
    [".", 8, "........"],
    [" ", 3, "   "],
    ["F", 1, "F"],
    [".", 0, ""],
  ])("repeats '%s' %d times", (characterToRepeat, sequenceLength, expectedSequence) => {
    expect(new SingleCharacterRepeatingSequenceGeneratorImpl(characterToRepeat).generateRepeatedCharacterSequence(sequenceLength)).toBe(
      expectedSequence,
    );
  });
});
