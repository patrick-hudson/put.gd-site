import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { ReadOnlyRepository } from "../../interfaces/repositories/ReadOnlyRepository";
import type { TestRunnerProgressLine } from "../../model/TestRunnerProgressLine";

@EnterpriseBean("com.putgd.enterprise.impl.repositories.HardcodedTestRunnerProgressLineRepositoryImpl")
export class HardcodedTestRunnerProgressLineRepositoryImpl implements ReadOnlyRepository<TestRunnerProgressLine> {
  public findAll(): readonly TestRunnerProgressLine[] {
    return [
      { testModulePath: "tests/test_auth.py", passedTestCountBeforeFailure: 8, failedTestCount: 0, passedTestCountAfterFailure: 0, trailingPaddingWidthInCharacters: 10, cumulativeCompletionPercentage: 4 },
      { testModulePath: "tests/test_billing.py", passedTestCountBeforeFailure: 10, failedTestCount: 0, passedTestCountAfterFailure: 0, trailingPaddingWidthInCharacters: 5, cumulativeCompletionPercentage: 9 },
      { testModulePath: "tests/test_upload.py", passedTestCountBeforeFailure: 4, failedTestCount: 1, passedTestCountAfterFailure: 5, trailingPaddingWidthInCharacters: 3, cumulativeCompletionPercentage: 13 },
      { testModulePath: "tests/test_webhooks.py", passedTestCountBeforeFailure: 7, failedTestCount: 0, passedTestCountAfterFailure: 0, trailingPaddingWidthInCharacters: 6, cumulativeCompletionPercentage: 16 },
    ];
  }
}
