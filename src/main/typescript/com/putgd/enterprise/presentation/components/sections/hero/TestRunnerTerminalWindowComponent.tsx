import { useEnterpriseBean } from "../../../../framework/ioc/react/EnterpriseApplicationContextReactBridge";
import type { ReadOnlyRepository } from "../../../../interfaces/repositories/ReadOnlyRepository";
import type { TestRunnerProgressLine } from "../../../../model/TestRunnerProgressLine";
import { WindowTitleBarComponent } from "../../primitives/WindowTitleBarComponent";
import { TestRunnerProgressLineComponent } from "./TestRunnerProgressLineComponent";

export function TestRunnerTerminalWindowComponent() {
  const testRunnerProgressLineRepository = useEnterpriseBean<ReadOnlyRepository<TestRunnerProgressLine>>("testRunnerProgressLineRepository");
  return (
    <div className="win term">
      <WindowTitleBarComponent windowTitle="~/src/api: make test" />
      <pre className="term-body">
        <span className="dim">$</span>
        {" make test\ncollected 215 items\n\n"}
        {testRunnerProgressLineRepository.findAll().map((testRunnerProgressLine) => (
          <TestRunnerProgressLineComponent key={testRunnerProgressLine.testModulePath} testRunnerProgressLine={testRunnerProgressLine} />
        ))}
        <span className="fail" id="fail">
          {"FAILED tests/test_upload.py::test_retry\n  AssertionError: expected 201, got 503\n"}
          <span className="bad">1 failed</span>
          {", "}
          <span className="ok">214 passed</span>
          {" in 8.31s"}
        </span>
      </pre>
    </div>
  );
}
