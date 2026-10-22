import { act, fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderEnterpriseApplication } from "../support/EnterpriseTestApplicationContextFactory";
import { fakeClipboardWriteText } from "../support/FakeBrowserEnvironment";

function getInstallCommandSnippet(installCommandSnippetHeading: string): HTMLElement {
  return screen.getByText(installCommandSnippetHeading, { selector: ".snippet > p" }).parentElement!;
}

async function clickCopyButtonOf(installCommandSnippetHeading: string): Promise<HTMLElement> {
  const copyButton = within(getInstallCommandSnippet(installCommandSnippetHeading)).getByRole("button");
  await act(async () => {
    fireEvent.click(copyButton);
  });
  return copyButton;
}

describe("install command copy buttons", () => {
  it.each([
    ["Debian, Ubuntu and Mint", "sudo apt install ./putgd-*.deb"],
    ["Fedora", "sudo dnf install ./putgd-*.rpm"],
    ["AppImage", "chmod +x putgd-*.AppImage && ./putgd-*.AppImage"],
  ])("copies the %s command verbatim", async (installCommandSnippetHeading, expectedCopiedCommand) => {
    renderEnterpriseApplication();
    await clickCopyButtonOf(installCommandSnippetHeading);
    expect(fakeClipboardWriteText).toHaveBeenCalledWith(expectedCopiedCommand);
  });

  it("confirms the copy for 1.8 seconds, then resets", async () => {
    vi.useFakeTimers();
    renderEnterpriseApplication();
    const copyButton = await clickCopyButtonOf("Fedora");
    expect(copyButton).toHaveTextContent("Copied");
    expect(copyButton).toHaveClass("copy", "done");

    act(() => vi.advanceTimersByTime(1799));
    expect(copyButton).toHaveTextContent("Copied");

    act(() => vi.advanceTimersByTime(1));
    expect(copyButton).toHaveTextContent("Copy");
    expect(copyButton).not.toHaveClass("done");
  });

  it("restarts the confirmation period on a second click", async () => {
    vi.useFakeTimers();
    renderEnterpriseApplication();
    await clickCopyButtonOf("Fedora");
    act(() => vi.advanceTimersByTime(1000));
    const copyButton = await clickCopyButtonOf("Fedora");
    act(() => vi.advanceTimersByTime(1000));
    expect(copyButton).toHaveTextContent("Copied");
    act(() => vi.advanceTimersByTime(800));
    expect(copyButton).toHaveTextContent("Copy");
  });

  it("asks the user to copy by hand when the clipboard refuses", async () => {
    fakeClipboardWriteText.mockRejectedValue(new DOMException("denied", "NotAllowedError"));
    renderEnterpriseApplication();
    const copyButton = await clickCopyButtonOf("AppImage");
    expect(copyButton).toHaveTextContent("Select and copy");
    expect(copyButton).toHaveClass("copy");
    expect(copyButton).not.toHaveClass("done");
  });

  it("only changes the button that was clicked", async () => {
    renderEnterpriseApplication();
    await clickCopyButtonOf("Fedora");
    expect(within(getInstallCommandSnippet("Debian, Ubuntu and Mint")).getByRole("button")).toHaveTextContent("Copy");
  });

  it("leaves no timers running after unmount", async () => {
    vi.useFakeTimers();
    const { unmount } = renderEnterpriseApplication();
    await clickCopyButtonOf("Fedora");
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
