export interface WindowTitleBarComponentProperties {
  readonly windowTitle: string;
}

export function WindowTitleBarComponent(windowTitleBarComponentProperties: WindowTitleBarComponentProperties) {
  return (
    <div className="win-bar">
      <span>{windowTitleBarComponentProperties.windowTitle}</span>
      <i></i>
      <i></i>
      <i></i>
    </div>
  );
}
