"use client";

/**
 * ScrollTrigger registration for the home landing components (home namespace).
 * Importing this module anywhere client-side registers the plugin once
 * (gsap.registerPlugin is idempotent). Same pattern as components/avis/scroll.ts.
 */
import { gsap } from "@/lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export { ScrollTrigger };
