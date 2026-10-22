export interface TestRunnerProgressLine {
  readonly testModulePath: string;
  readonly passedTestCountBeforeFailure: number;
  readonly failedTestCount: number;
  readonly passedTestCountAfterFailure: number;
  readonly trailingPaddingWidthInCharacters: number;
  readonly cumulativeCompletionPercentage: number;
}
