import "@testing-library/jest-dom/vitest";
import "@putgd-enterprise/ComponentScan";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import { resetFakeBrowserEnvironment } from "./FakeBrowserEnvironment";

beforeEach(() => {
  resetFakeBrowserEnvironment();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
