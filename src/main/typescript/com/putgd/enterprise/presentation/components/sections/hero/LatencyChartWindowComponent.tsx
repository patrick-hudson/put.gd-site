import { WindowTitleBarComponent } from "../../primitives/WindowTitleBarComponent";

const P95_LATENCY_SERIES_PATH_DEFINITION =
  "M0 110 L30 104 L60 108 L90 100 L120 103 L150 96 L175 98 L195 40 L210 22 L225 64 L245 92 L270 96 L300 94";

export function LatencyChartWindowComponent() {
  return (
    <div className="win chart">
      <WindowTitleBarComponent windowTitle="p95 latency, api" />
      <svg viewBox="0 0 300 140" preserveAspectRatio="none" aria-hidden="true">
        <g className="grid">
          <path d="M0 35H300M0 70H300M0 105H300" />
        </g>
        <path className="area" d={`${P95_LATENCY_SERIES_PATH_DEFINITION} V140 H0Z`} />
        <path className="line" d={P95_LATENCY_SERIES_PATH_DEFINITION} />
      </svg>
    </div>
  );
}
