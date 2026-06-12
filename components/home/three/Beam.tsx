"use client";

/**
 * Beam — spec §1/§2.1 name for the « Le Faisceau » wrapper; the only file
 * HomeStory imports. The implementation lives in ThreeStage.tsx (same
 * component, two import paths).
 *
 *   import Beam from "@/components/home/three/Beam";
 *   <Beam progressRef={progressRef} velocityRef={velocityRef} />
 */

export {
  default,
  createBeamProgress,
  type BeamProgress,
  type MutableRef,
  type ThreeStageProps,
  type ThreeStageProps as BeamProps,
} from "./ThreeStage";
