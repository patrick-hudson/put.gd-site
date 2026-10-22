import { describe, expect, it } from "vitest";
import { BracketedPercentageColumnFormatterImpl } from "@putgd-enterprise/impl/formatters/BracketedPercentageColumnFormatterImpl";
import { ConsoleSessionAccessibleLabelFormatterImpl } from "@putgd-enterprise/impl/formatters/ConsoleSessionAccessibleLabelFormatterImpl";
import { MebibyteByteSizeFormatterImpl } from "@putgd-enterprise/impl/formatters/MebibyteByteSizeFormatterImpl";
import { SelectionReadoutDimensionsFormatterImpl } from "@putgd-enterprise/impl/formatters/SelectionReadoutDimensionsFormatterImpl";
import { UserLocalePublicationDateFormatterImpl } from "@putgd-enterprise/impl/formatters/UserLocalePublicationDateFormatterImpl";
import { ConsoleLineClassification } from "@putgd-enterprise/model/ConsoleLine";
import { formatPublicationDateTheWayTheUserLocaleWould } from "../../support/ReleaseManifestTestFixtures";

describe("SelectionReadoutDimensionsFormatterImpl", () => {
  it("joins width and height with the configured separator", () => {
    expect(
      new SelectionReadoutDimensionsFormatterImpl(" × ").format({ selectionWidthInPixels: 612, selectionHeightInPixels: 133 }),
    ).toBe("612 × 133");
  });
});

describe("MebibyteByteSizeFormatterImpl", () => {
  const mebibyteByteSizeFormatter = new MebibyteByteSizeFormatterImpl(1048576, 1, " MB");

  it.each([
    [1048576, "1.0 MB"],
    [40475443, "38.6 MB"],
    [0, "0.0 MB"],
    [52428, "0.0 MB"],
    [104858, "0.1 MB"],
  ])("formats %d bytes as %s", (sizeInBytes, expectedFormattedSize) => {
    expect(mebibyteByteSizeFormatter.format(sizeInBytes)).toBe(expectedFormattedSize);
  });
});

describe("UserLocalePublicationDateFormatterImpl", () => {
  it("formats in the user's locale with a short month", () => {
    expect(new UserLocalePublicationDateFormatterImpl().format("2026-10-22T03:00:00Z")).toBe(
      formatPublicationDateTheWayTheUserLocaleWould("2026-10-22T03:00:00Z"),
    );
  });
});

describe("BracketedPercentageColumnFormatterImpl", () => {
  const percentageColumnFormatter = new BracketedPercentageColumnFormatterImpl(3);

  it.each([
    [4, "[  4%]"],
    [13, "[ 13%]"],
    [100, "[100%]"],
  ])("formats %d as %s", (completionPercentage, expectedColumn) => {
    expect(percentageColumnFormatter.format(completionPercentage)).toBe(expectedColumn);
  });
});

describe("ConsoleSessionAccessibleLabelFormatterImpl", () => {
  it("prefixes commands with the prompt and collapses whitespace like the legacy textContent did", () => {
    const consoleSessionAccessibleLabelFormatter = new ConsoleSessionAccessibleLabelFormatterImpl("Example putgd-cli session: ", "$");
    expect(
      consoleSessionAccessibleLabelFormatter.format([
        { consoleLineClassification: ConsoleLineClassification.SHELL_COMMAND, consoleLineText: "putgd-cli   capabilities" },
        { consoleLineClassification: ConsoleLineClassification.EXPLANATORY_COMMENT, consoleLineText: "# what this desktop supports" },
      ]),
    ).toBe("Example putgd-cli session: $ putgd-cli capabilities # what this desktop supports");
  });
});
