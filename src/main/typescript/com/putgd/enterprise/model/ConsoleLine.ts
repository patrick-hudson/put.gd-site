export enum ConsoleLineClassification {
  SHELL_COMMAND = "SHELL_COMMAND",
  EXPLANATORY_COMMENT = "EXPLANATORY_COMMENT",
}

export interface ConsoleLine {
  readonly consoleLineClassification: ConsoleLineClassification;
  readonly consoleLineText: string;
}
