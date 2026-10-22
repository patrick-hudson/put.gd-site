import { describe, expect, it } from "vitest";
import type { ReadOnlyRepository } from "@putgd-enterprise/interfaces/repositories/ReadOnlyRepository";
import type { ConsoleLine } from "@putgd-enterprise/model/ConsoleLine";
import type { NavigationLink } from "@putgd-enterprise/model/NavigationLink";
import type { PackageRowDescriptor } from "@putgd-enterprise/model/PackageRowDescriptor";
import type { PipelineStop } from "@putgd-enterprise/model/PipelineStop";
import type { TestRunnerProgressLine } from "@putgd-enterprise/model/TestRunnerProgressLine";
import { createProductionEnterpriseApplicationContext } from "../../support/EnterpriseTestApplicationContextFactory";

function findAllFromRepository<TEntity>(repositoryBeanIdentifier: string): readonly TEntity[] {
  return createProductionEnterpriseApplicationContext().getBean<ReadOnlyRepository<TEntity>>(repositoryBeanIdentifier).findAll();
}

describe("content repositories", () => {
  it("lists the five pipeline stops in order", () => {
    expect(findAllFromRepository<PipelineStop>("pipelineStopRepository").map((pipelineStop) => pipelineStop.pipelineStopHeading)).toEqual([
      "Trigger",
      "Capture",
      "Edit, if you want to",
      "Upload",
      "Receipt",
    ]);
  });

  it("puts the default hotkeys on the Trigger stop only", () => {
    const [triggerPipelineStop, ...remainingPipelineStops] = findAllFromRepository<PipelineStop>("pipelineStopRepository");
    expect(triggerPipelineStop.keyboardShortcutBindings.map((binding) => binding.boundActionDescription)).toEqual([
      "Capture region",
      "Capture window",
      "Capture desktop",
    ]);
    for (const remainingPipelineStop of remainingPipelineStops) {
      expect(remainingPipelineStop.keyboardShortcutBindings).toEqual([]);
    }
  });

  it("only references screenshots that exist", async () => {
    const { existsSync } = await import("node:fs");
    for (const pipelineStop of findAllFromRepository<PipelineStop>("pipelineStopRepository")) {
      expect(existsSync(`public/_site/${pipelineStop.plateImage.relativeAssetPath}`), pipelineStop.plateImage.relativeAssetPath).toBe(true);
    }
  });

  it("lists one package row per release asset key that releases.py produces", () => {
    expect(
      findAllFromRepository<PackageRowDescriptor>("packageRowDescriptorRepository").map((descriptor) => descriptor.releaseAssetMatchKey),
    ).toEqual(["ubuntu24.04", "ubuntu26.04", "debian13", "fedora44", ".AppImage"]);
  });

  it("alternates commands and comments in the console session, ending on two commands", () => {
    expect(
      findAllFromRepository<ConsoleLine>("consoleLineRepository").map((consoleLine) => consoleLine.consoleLineClassification),
    ).toEqual([
      "SHELL_COMMAND",
      "EXPLANATORY_COMMENT",
      "SHELL_COMMAND",
      "EXPLANATORY_COMMENT",
      "SHELL_COMMAND",
      "EXPLANATORY_COMMENT",
      "SHELL_COMMAND",
      "SHELL_COMMAND",
    ]);
  });

  it("adds up to the 215 tests the hero terminal claims to have collected... eventually", () => {
    const totalTestsShown = findAllFromRepository<TestRunnerProgressLine>("testRunnerProgressLineRepository").reduce(
      (runningTotal, progressLine) =>
        runningTotal + progressLine.passedTestCountBeforeFailure + progressLine.failedTestCount + progressLine.passedTestCountAfterFailure,
      0,
    );
    expect(totalTestsShown).toBe(35);
    expect(totalTestsShown).toBeLessThan(215);
  });

  it("points the navigation at the right places", () => {
    expect(findAllFromRepository<NavigationLink>("primaryNavigationLinkRepository")).toEqual([
      { navigationLinkLabel: "How it works", navigationLinkHref: "#pipeline" },
      { navigationLinkLabel: "Scripting", navigationLinkHref: "#script" },
      { navigationLinkLabel: "Source", navigationLinkHref: "https://github.com/patrick-hudson/put.gd-desktop" },
      { navigationLinkLabel: "Install", navigationLinkHref: "#install" },
    ]);
    expect(
      findAllFromRepository<NavigationLink>("footerNavigationLinkRepository").map((navigationLink) => navigationLink.navigationLinkLabel),
    ).toEqual(["Source", "Releases", "User guide", "Issues"]);
  });

  it("lists the three install commands and six details", () => {
    expect(findAllFromRepository("installCommandSnippetRepository")).toHaveLength(3);
    expect(findAllFromRepository("productDetailEntryRepository")).toHaveLength(6);
  });
});
