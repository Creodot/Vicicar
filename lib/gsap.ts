"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(useGSAP, CustomEase);

/* IX2 "ease" = cubic-bezier(0.25, 0.1, 0.25, 1) — used by page-load fades
   (navbar / tagline). Registered once as "wfEase". */
export const wfEase: string = (() => {
  if (!CustomEase.get("wfEase")) {
    CustomEase.create("wfEase", "0.25,0.1,0.25,1");
  }
  return "wfEase";
})();

/* IX2 "outQuad" = 1-(1-t)^2 — exactly GSAP power1.out (verified in webflow.js). */
export const outQuad = "power1.out";

/* CSS-side easings (for transitions, not GSAP) */
export const outQuadCss = "cubic-bezier(.25,.46,.45,.94)";
export const outQuartCss = "cubic-bezier(.165,.84,.44,1)";

export { gsap, useGSAP };
