export function DesktopPanelComponent() {
  return (
    <div className="panel" aria-hidden="true">
      <span className="launcher"></span>
      <span className="tray">
        <svg viewBox="0 0 24 24">
          <path d="M3 9a13 13 0 0 1 18 0M6.5 12.5a8 8 0 0 1 11 0M10 16a3 3 0 0 1 4 0" />
        </svg>
        <svg viewBox="0 0 24 24">
          <path d="M4 9h4l5-4v14l-5-4H4zM16 9a4 4 0 0 1 0 6" />
        </svg>
        <span className="tray-putgd" id="trayIcon">
          <svg viewBox="0 0 24 24">
            <path className="base" d="M2 13H6V18Q6 19 7 19H17Q18 19 18 18V13H22V18Q22 23 17 23H7Q2 23 2 18Z" />
            <path className="arrow" d="M12 2L20 10H15V16H9V10H4Z" />
          </svg>
        </span>
        <time>17:26</time>
      </span>
    </div>
  );
}
