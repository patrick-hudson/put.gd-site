import { useEnterpriseBean } from "../../../../framework/ioc/react/EnterpriseApplicationContextReactBridge";
import type { Formatter } from "../../../../interfaces/formatters/Formatter";
import type { RepeatedCharacterSequenceGenerator } from "../../../../interfaces/generators/RepeatedCharacterSequenceGenerator";
import type { TestRunnerProgressLine } from "../../../../model/TestRunnerProgressLine";

export interface TestRunnerProgressLineComponentProperties {
  readonly testRunnerProgressLine: TestRunnerProgressLine;
}

export function TestRunnerProgressLineComponent(testRunnerProgressLineComponentProperties: TestRunnerProgressLineComponentProperties) {
  const whitespaceSequenceGenerator = useEnterpriseBean<RepeatedCharacterSequenceGenerator>("whitespaceSequenceGenerator");
  const passedTestMarkerSequenceGenerator = useEnterpriseBean<RepeatedCharacterSequenceGenerator>("passedTestMarkerSequenceGenerator");
  const failedTestMarkerSequenceGenerator = useEnterpriseBean<RepeatedCharacterSequenceGenerator>("failedTestMarkerSequenceGenerator");
  const percentageColumnFormatter = useEnterpriseBean<Formatter<number>>("percentageColumnFormatter");
  const { testRunnerProgressLine } = testRunnerProgressLineComponentProperties;
  const hasFailedTests = testRunnerProgressLine.failedTestCount > 0;

  return (
    <>
      {testRunnerProgressLine.testModulePath + whitespaceSequenceGenerator.generateRepeatedCharacterSequence(1)}
      <span className="ok">
        {passedTestMarkerSequenceGenerator.generateRepeatedCharacterSequence(testRunnerProgressLine.passedTestCountBeforeFailure)}
      </span>
      {hasFailedTests && (
        <>
          <span className="bad">
            {failedTestMarkerSequenceGenerator.generateRepeatedCharacterSequence(testRunnerProgressLine.failedTestCount)}
          </span>
          <span className="ok">
            {passedTestMarkerSequenceGenerator.generateRepeatedCharacterSequence(testRunnerProgressLine.passedTestCountAfterFailure)}
          </span>
        </>
      )}
      {whitespaceSequenceGenerator.generateRepeatedCharacterSequence(testRunnerProgressLine.trailingPaddingWidthInCharacters) +
        percentageColumnFormatter.format(testRunnerProgressLine.cumulativeCompletionPercentage) +
        "\n"}
    </>
  );
}
