import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { ReadOnlyRepository } from "../../interfaces/repositories/ReadOnlyRepository";
import { ConsoleLineClassification, type ConsoleLine } from "../../model/ConsoleLine";

@EnterpriseBean("com.putgd.enterprise.impl.repositories.HardcodedConsoleLineRepositoryImpl")
export class HardcodedConsoleLineRepositoryImpl implements ReadOnlyRepository<ConsoleLine> {
  public findAll(): readonly ConsoleLine[] {
    const { SHELL_COMMAND, EXPLANATORY_COMMENT } = ConsoleLineClassification;
    return [
      { consoleLineClassification: SHELL_COMMAND, consoleLineText: "putgd-cli capabilities" },
      { consoleLineClassification: EXPLANATORY_COMMENT, consoleLineText: "# what this desktop actually supports" },
      { consoleLineClassification: SHELL_COMMAND, consoleLineText: `putgd-cli action.invoke '{"action":"region"}'` },
      { consoleLineClassification: EXPLANATORY_COMMENT, consoleLineText: "# returns an operation id right away" },
      { consoleLineClassification: SHELL_COMMAND, consoleLineText: `putgd-cli operation.inspect '{"id":"OPERATION-ID"}'` },
      { consoleLineClassification: EXPLANATORY_COMMENT, consoleLineText: "# phase, bytes, link, outcome" },
      { consoleLineClassification: SHELL_COMMAND, consoleLineText: `putgd-cli history.list '{"limit":5,"category":"images"}'` },
      { consoleLineClassification: SHELL_COMMAND, consoleLineText: `putgd-cli recording.prepare '{"target":{"kind":"region"},"format":"mp4"}'` },
    ];
  }
}
