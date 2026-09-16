"use client";

import { useEffect } from "react";

import { captureInitialAttribution } from "@/domain/lead/attribution";

export function AttributionCapture() {
  useEffect(() => {
    captureInitialAttribution(window.location, document.referrer);
  }, []);

  return null;
}
