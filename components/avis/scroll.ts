"use client";

/**
 * ScrollTrigger registration for the /avis page components (avis namespace).
 * Importing this module anywhere client-side registers the plugin once
 * (gsap.registerPlugin is idempotent).
 */
import { gsap } from "@/lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export { ScrollTrigger };
