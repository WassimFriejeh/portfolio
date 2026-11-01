"use client";

import { useEffect } from "react";

type NavigatorPerformanceHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

export function PerformanceMode() {
  useEffect(() => {
    const navigatorWithHints = navigator as NavigatorPerformanceHints;
    const hasLowMemory =
      typeof navigatorWithHints.deviceMemory === "number" && navigatorWithHints.deviceMemory <= 4;
    const hasFewCores =
      typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4;

    if (hasLowMemory || hasFewCores || navigatorWithHints.connection?.saveData) {
      document.documentElement.dataset.performance = "low";
    }
  }, []);

  return null;
}
