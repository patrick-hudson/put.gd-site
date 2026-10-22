import { describe, expect, it } from "vitest";
import { AppImageAwareReleaseAssetMatchKeyToPermalinkSlugConverterImpl } from "@putgd-enterprise/impl/converters/AppImageAwareReleaseAssetMatchKeyToPermalinkSlugConverterImpl";
import { BooleanToAriaBooleanAttributeValueConverterImpl } from "@putgd-enterprise/impl/converters/BooleanToAriaBooleanAttributeValueConverterImpl";
import { CopyButtonStateToClassNameConverterImpl } from "@putgd-enterprise/impl/converters/CopyButtonStateToClassNameConverterImpl";
import { CopyButtonStateToLabelConverterImpl } from "@putgd-enterprise/impl/converters/CopyButtonStateToLabelConverterImpl";
import { CopyButtonBaseClassNameStringReturnerImpl } from "@putgd-enterprise/impl/stringreturners/CopyButtonBaseClassNameStringReturnerImpl";
import { CopyButtonClipboardUnavailableLabelStringReturnerImpl } from "@putgd-enterprise/impl/stringreturners/CopyButtonClipboardUnavailableLabelStringReturnerImpl";
import { CopyButtonConfirmationClassNameStringReturnerImpl } from "@putgd-enterprise/impl/stringreturners/CopyButtonConfirmationClassNameStringReturnerImpl";
import { CopyButtonConfirmationLabelStringReturnerImpl } from "@putgd-enterprise/impl/stringreturners/CopyButtonConfirmationLabelStringReturnerImpl";
import { CopyButtonIdleLabelStringReturnerImpl } from "@putgd-enterprise/impl/stringreturners/CopyButtonIdleLabelStringReturnerImpl";
import { CopyButtonState } from "@putgd-enterprise/model/CopyButtonState";

describe("AppImageAwareReleaseAssetMatchKeyToPermalinkSlugConverterImpl", () => {
  const releaseAssetMatchKeyToPermalinkSlugConverter = new AppImageAwareReleaseAssetMatchKeyToPermalinkSlugConverterImpl(
    ".AppImage",
    "appimage",
  );

  it("turns the AppImage match key into its permalink slug", () => {
    expect(releaseAssetMatchKeyToPermalinkSlugConverter.convert(".AppImage")).toBe("appimage");
  });

  it.each(["ubuntu24.04", "ubuntu26.04", "debian13", "fedora44"])("passes %s through unchanged", (releaseAssetMatchKey) => {
    expect(releaseAssetMatchKeyToPermalinkSlugConverter.convert(releaseAssetMatchKey)).toBe(releaseAssetMatchKey);
  });
});

describe("BooleanToAriaBooleanAttributeValueConverterImpl", () => {
  const booleanToAriaBooleanAttributeValueConverter = new BooleanToAriaBooleanAttributeValueConverterImpl();

  it("converts true", () => {
    expect(booleanToAriaBooleanAttributeValueConverter.convert(true)).toBe("true");
  });

  it("converts false", () => {
    expect(booleanToAriaBooleanAttributeValueConverter.convert(false)).toBe("false");
  });

  it("converts a value that is somehow neither true nor false, defensively", () => {
    expect(booleanToAriaBooleanAttributeValueConverter.convert(undefined as unknown as boolean)).toBe("false");
  });
});

describe("CopyButtonStateToLabelConverterImpl", () => {
  const copyButtonStateToLabelConverter = new CopyButtonStateToLabelConverterImpl(
    new CopyButtonIdleLabelStringReturnerImpl(),
    new CopyButtonConfirmationLabelStringReturnerImpl(),
    new CopyButtonClipboardUnavailableLabelStringReturnerImpl(),
  );

  it.each([
    [CopyButtonState.AWAITING_USER_INTERACTION, "Copy"],
    [CopyButtonState.TEXT_COPIED_TO_CLIPBOARD, "Copied"],
    [CopyButtonState.CLIPBOARD_UNAVAILABLE, "Select and copy"],
  ])("labels %s as '%s'", (copyButtonState, expectedLabel) => {
    expect(copyButtonStateToLabelConverter.convert(copyButtonState)).toBe(expectedLabel);
  });
});

describe("CopyButtonStateToClassNameConverterImpl", () => {
  const copyButtonStateToClassNameConverter = new CopyButtonStateToClassNameConverterImpl(
    new CopyButtonBaseClassNameStringReturnerImpl(),
    new CopyButtonConfirmationClassNameStringReturnerImpl(),
  );

  it.each([
    [CopyButtonState.AWAITING_USER_INTERACTION, "copy"],
    [CopyButtonState.TEXT_COPIED_TO_CLIPBOARD, "copy done"],
    [CopyButtonState.CLIPBOARD_UNAVAILABLE, "copy"],
  ])("gives %s the class '%s'", (copyButtonState, expectedClassName) => {
    expect(copyButtonStateToClassNameConverter.convert(copyButtonState)).toBe(expectedClassName);
  });
});
