import { act, fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderEnterpriseApplication } from "../support/EnterpriseTestApplicationContextFactory";
import { fakeFetch } from "../support/FakeBrowserEnvironment";
import {
  formatPublicationDateTheWayTheUserLocaleWould,
  NIGHTLY_RELEASE_WITH_ONLY_FEDORA_AND_NO_CHECKSUMS,
  RELEASE_MANIFEST_WITH_BOTH_CHANNELS,
  RELEASE_MANIFEST_WITH_NO_RELEASES,
  RELEASE_MANIFEST_WITH_ONLY_NIGHTLY,
  serveReleaseManifest,
  STABLE_RELEASE_WITH_EVERY_PACKAGE,
} from "../support/ReleaseManifestTestFixtures";

const RELEASES_PAGE_URL = "https://github.com/patrick-hudson/put.gd-desktop/releases";

function getReleaseChannelGroup(): HTMLElement {
  return document.getElementById("channel")!;
}

function getPackageRow(releaseAssetMatchKey: string): HTMLTableRowElement {
  const packageRow = document.querySelector<HTMLTableRowElement>(`tr[data-match="${releaseAssetMatchKey}"]`);
  if (packageRow === null) {
    throw new Error(`no package row for ${releaseAssetMatchKey}`);
  }
  return packageRow;
}

function getReleaseLine(): HTMLElement {
  return document.getElementById("releaseLine")!;
}

function getChannelNote(): HTMLElement {
  return document.getElementById("channelNote")!;
}

async function waitForReleaseManifestToBeApplied(): Promise<void> {
  await screen.findByRole("group", { name: "Release channel" });
}

describe("install section", () => {
  it("keeps the static table, hidden channel toggle and release line while there is no manifest", async () => {
    renderEnterpriseApplication();
    await act(async () => undefined);
    expect(getReleaseChannelGroup()).not.toBeVisible();
    expect(getChannelNote()).not.toBeVisible();
    expect(getReleaseLine()).toHaveTextContent(
      "x86_64 packages for each supported release are on the releases page, with SHA256SUMS and build receipts next to them.",
    );
    const fedoraPackageRow = getPackageRow("fedora44");
    expect(within(fedoraPackageRow).getByText("putgd-VERSION-fedora44-x86_64.rpm")).toBeInTheDocument();
    expect(within(fedoraPackageRow).getByRole("link", { name: "Download" })).toHaveAttribute("href", RELEASES_PAGE_URL);
  });

  it("requests /_site/releases.json without the HTTP cache", async () => {
    renderEnterpriseApplication();
    await act(async () => undefined);
    expect(fakeFetch).toHaveBeenCalledWith("/_site/releases.json", { cache: "no-cache" });
  });

  it("keeps the static content when releases.json answers 404", async () => {
    fakeFetch.mockResolvedValue(new Response("", { status: 404 }));
    renderEnterpriseApplication();
    await act(async () => undefined);
    expect(getReleaseChannelGroup()).not.toBeVisible();
    expect(within(getPackageRow("debian13")).getByRole("link", { name: "Download" })).toHaveAttribute("href", RELEASES_PAGE_URL);
  });

  it("keeps the static content when both channels are empty", async () => {
    serveReleaseManifest(RELEASE_MANIFEST_WITH_NO_RELEASES);
    renderEnterpriseApplication();
    await act(async () => undefined);
    expect(getReleaseChannelGroup()).not.toBeVisible();
    expect(getReleaseLine()).toHaveTextContent(/^x86_64 packages/);
  });

  it("shows the stable release by default when there is one", async () => {
    serveReleaseManifest(RELEASE_MANIFEST_WITH_BOTH_CHANNELS);
    renderEnterpriseApplication();
    await waitForReleaseManifestToBeApplied();

    expect(screen.getByRole("button", { name: "Stable" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Nightly" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Nightly" })).toBeEnabled();
    expect(getChannelNote()).not.toBeVisible();
    expect(getReleaseLine()).toHaveTextContent(
      `Stable v1.0.0, published ${formatPublicationDateTheWayTheUserLocaleWould(STABLE_RELEASE_WITH_EVERY_PACKAGE.published_at)}. ` +
        "Every file, the build receipts and SHA256SUMS are on the release page.",
    );
    expect(within(getReleaseLine()).getByRole("link", { name: "v1.0.0" })).toHaveAttribute(
      "href",
      STABLE_RELEASE_WITH_EVERY_PACKAGE.html_url,
    );
    expect(within(getReleaseLine()).getByRole("link", { name: "SHA256SUMS" })).toHaveAttribute(
      "href",
      "https://app.put.gd/dl/stable/checksums",
    );
  });

  it.each([
    ["ubuntu24.04", "putgd-1.0.0-ubuntu24.04-x86_64.deb", "https://app.put.gd/dl/stable/ubuntu24.04"],
    ["ubuntu26.04", "putgd-1.0.0-ubuntu26.04-x86_64.deb", "https://app.put.gd/dl/stable/ubuntu26.04"],
    ["debian13", "putgd-1.0.0-debian13-x86_64.deb", "https://app.put.gd/dl/stable/debian13"],
    ["fedora44", "putgd-1.0.0-fedora44-x86_64.rpm", "https://app.put.gd/dl/stable/fedora44"],
    [".AppImage", "putgd-1.0.0-x86_64.AppImage", "https://app.put.gd/dl/stable/appimage"],
  ])("fills in the %s row with the asset name, size and permalink", async (releaseAssetMatchKey, expectedFileName, expectedPermalink) => {
    serveReleaseManifest(RELEASE_MANIFEST_WITH_BOTH_CHANNELS);
    renderEnterpriseApplication();
    await waitForReleaseManifestToBeApplied();
    const packageRow = getPackageRow(releaseAssetMatchKey);
    expect(packageRow.querySelector(".file")).toHaveTextContent(`${expectedFileName}1.0 MB`);
    expect(packageRow.querySelector(".file .size")).toHaveTextContent("1.0 MB");
    expect(within(packageRow).getByRole("link", { name: "Download" })).toHaveAttribute("href", expectedPermalink);
  });

  it("switches to nightly, falling back to the release page for packages it lacks", async () => {
    serveReleaseManifest(RELEASE_MANIFEST_WITH_BOTH_CHANNELS);
    renderEnterpriseApplication();
    await waitForReleaseManifestToBeApplied();

    fireEvent.click(screen.getByRole("button", { name: "Nightly" }));

    expect(screen.getByRole("button", { name: "Nightly" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Stable" })).toHaveAttribute("aria-pressed", "false");
    expect(within(getPackageRow("fedora44")).getByRole("link", { name: "Download" })).toHaveAttribute(
      "href",
      "https://app.put.gd/dl/nightly/fedora44",
    );
    const debianPackageRow = getPackageRow("debian13");
    expect(within(debianPackageRow).getByRole("link", { name: "Release page" })).toHaveAttribute(
      "href",
      NIGHTLY_RELEASE_WITH_ONLY_FEDORA_AND_NO_CHECKSUMS.html_url,
    );
    expect(debianPackageRow.querySelector(".file")).toHaveTextContent(/^putgd-VERSION-debian13-x86_64\.deb$/);
    expect(getChannelNote()).toBeVisible();
    expect(getChannelNote()).toHaveTextContent(
      "Nightlies pass the full test suites and package audits on every build, but are not desktop-certified. Stable releases are.",
    );
    expect(within(getReleaseLine()).queryByRole("link", { name: "SHA256SUMS" })).not.toBeInTheDocument();
    expect(getReleaseLine()).toHaveTextContent(/Every file, the build receipts are on the release page\.$/);
  });

  it("switches back to stable", async () => {
    serveReleaseManifest(RELEASE_MANIFEST_WITH_BOTH_CHANNELS);
    renderEnterpriseApplication();
    await waitForReleaseManifestToBeApplied();
    fireEvent.click(screen.getByRole("button", { name: "Nightly" }));
    fireEvent.click(screen.getByRole("button", { name: "Stable" }));
    expect(screen.getByRole("button", { name: "Stable" })).toHaveAttribute("aria-pressed", "true");
    expect(getChannelNote()).not.toBeVisible();
  });

  it("opens on nightly when the page is visited with #nightly", async () => {
    window.history.replaceState(null, "", "/#nightly");
    serveReleaseManifest(RELEASE_MANIFEST_WITH_BOTH_CHANNELS);
    renderEnterpriseApplication();
    await waitForReleaseManifestToBeApplied();
    expect(screen.getByRole("button", { name: "Nightly" })).toHaveAttribute("aria-pressed", "true");
  });

  it("opens on nightly and disables stable when no stable release exists", async () => {
    serveReleaseManifest(RELEASE_MANIFEST_WITH_ONLY_NIGHTLY);
    renderEnterpriseApplication();
    await waitForReleaseManifestToBeApplied();
    expect(screen.getByRole("button", { name: "Stable" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Nightly" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Stable" }));
    expect(screen.getByRole("button", { name: "Nightly" })).toHaveAttribute("aria-pressed", "true");
  });

  it("explains an empty channel when it is the one selected", async () => {
    window.history.replaceState(null, "", "/#nightly");
    serveReleaseManifest({ stable: STABLE_RELEASE_WITH_EVERY_PACKAGE, nightly: null });
    renderEnterpriseApplication();
    await waitForReleaseManifestToBeApplied();
    expect(screen.getByRole("button", { name: "Nightly" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Stable" })).toHaveAttribute("aria-pressed", "true");
  });
});
