import { describe, expect, it } from "vitest";
import type { StringReturner } from "@putgd-enterprise/interfaces/stringreturners/StringReturner";
import { createProductionEnterpriseApplicationContext } from "../../support/EnterpriseTestApplicationContextFactory";

describe("string returners", () => {
  it.each([
    ["copyButtonIdleLabelStringReturner", "Copy"],
    ["copyButtonConfirmationLabelStringReturner", "Copied"],
    ["copyButtonClipboardUnavailableLabelStringReturner", "Select and copy"],
    ["copyButtonBaseClassNameStringReturner", "copy"],
    ["copyButtonConfirmationClassNameStringReturner", "copy done"],
    ["downloadLinkLabelStringReturner", "Download"],
    ["releasePageLinkLabelStringReturner", "Release page"],
    ["consoleSessionStaticAccessibleLabelStringReturner", "Example putgd-cli session"],
  ])("%s returns '%s'", (stringReturnerBeanIdentifier, expectedReturnString) => {
    expect(
      createProductionEnterpriseApplicationContext().getBean<StringReturner>(stringReturnerBeanIdentifier).getReturnString(),
    ).toBe(expectedReturnString);
  });

  it("returns the same string every time it is asked", () => {
    const downloadLinkLabelStringReturner = createProductionEnterpriseApplicationContext().getBean<StringReturner>(
      "downloadLinkLabelStringReturner",
    );
    expect(downloadLinkLabelStringReturner.getReturnString()).toBe(downloadLinkLabelStringReturner.getReturnString());
  });
});
