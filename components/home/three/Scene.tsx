"use client";

/**
 * Scene — the imperative three.js scene for « Le Faisceau » (spec §2.2).
 * Loaded ONLY via next/dynamic(ssr:false) from ThreeStage/Beam.
 *
 * Two layers, everything procedural (zero textures, zero loaders):
 *  (a) bodywork sheen — full-screen quad, RawShaderMaterial: 3-octave value
 *      noise stretched 8:1 (brushed metal), one anisotropic specular streak
 *      sliding bottom-left → top-right with uSweep, two headlight glows
 *      driven by uArrive, fragment luminance hard-capped at 0.18
 *      (0.45 inside headlight cores at uArrive > 0.9), all × uFade.
 *      Premultiplied-alpha blending so the canvas composites as pure light
 *      over the CSS gradient base layer.
 *  (b) the trail — InstancedMesh (600 desktop / 250 ≤767px) of additive
 *      quads seeded along a cubic Bézier in the lower third; length scales
 *      with the lerped scroll velocity, instances drift slowly along t,
 *      and converge into the two headlight anchors as uArrive → 1.
 *
 * Render loop on gsap.ticker, render-on-demand (skips when progress deltas
 * < 0.0005 and uVelocity < 0.003), paused when the canvas leaves the
 * viewport or the tab is hidden. Full dispose on unmount.
 */

import { useEffect, useRef } from "react";
import {
  AddEquation,
  AdditiveBlending,
  CustomBlending,
  InstancedBufferAttribute,
  InstancedMesh,
  Mesh,
  OneFactor,
  OneMinusSrcAlphaFactor,
  OrthographicCamera,
  PlaneGeometry,
  RawShaderMaterial,
  Scene as ThreeScene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";
import { gsap } from "@/lib/gsap";
import type { BeamProgress, MutableRef } from "./ThreeStage";

interface SceneProps {
  progressRef: MutableRef<BeamProgress>;
  velocityRef: MutableRef<number>;
  onContextLost?: () => void;
}

/* ------------------------------------------------------------------ */
/* Shaders                                                             */
/* ------------------------------------------------------------------ */

const AZURE = "vec3(0.8510, 0.9137, 0.9137)"; /* --azure #d9e9e9 */

const SHEEN_VERT = /* glsl */ `
precision highp float;
attribute vec3 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const SHEEN_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uSweep;
uniform float uFade;
uniform float uArrive;
uniform float uAspect;

const vec3 AZURE = ${AZURE};

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}
/* 3 octaves of value noise */
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * vnoise(p);
    p *= 2.17;
    a *= 0.5;
  }
  return v;
}

void main() {
  /* Curved-panel feel: subtle vertical bow so it reads as a fender. */
  vec2 uv = vUv;
  uv.y += 0.15 * sin(uv.x * 2.2);

  /* Procedural normal field, UV stretched 8:1 horizontally (brushed metal). */
  float n = fbm(vec2(uv.x * 3.0, uv.y * 24.0));

  /* ONE anisotropic GGX-style streak, bottom-left -> top-right with uSweep. */
  vec2 streakPos = mix(vec2(-0.3, 0.15), vec2(1.3, 0.85), uSweep);
  vec2 d = uv - streakPos;
  vec2 dir = normalize(vec2(1.0, 0.4375)); /* the sweep diagonal */
  float along = dot(d, dir);
  float across = dot(d, vec2(-dir.y, dir.x)) + (n - 0.5) * 0.10;
  float spec = exp(-across * across * 220.0) * exp(-along * along * 3.0);
  spec *= 0.55 + 0.45 * fbm(vec2(uv.x * 1.5, uv.y * 30.0));

  vec3 hCol = mix(vec3(1.0), AZURE, smoothstep(0.3, 0.9, uSweep));
  vec3 col = hCol * spec * 0.35 + vec3(n) * 0.05;

  /* Two headlight glows — the S4 payoff (no extra geometry). On portrait
     aspects (< 0.8) the centers drop to UV y 0.16 so the glow clears the
     centered CTA sub-line block on tall screens. Because the distance x is
     aspect-corrected, fixed UV centers would merge into one blob on
     portrait: widen the separation by 1/uAspect (centers clamped to
     0.30/0.70) and shrink the radius so the two lights stay distinct. */
  float portrait = 1.0 - step(0.8, uAspect);
  float ay = mix(0.16, 0.28, step(0.8, uAspect));
  float sep = clamp(0.08 / min(uAspect, 1.0), 0.08, 0.20);
  float r = mix(0.0, mix(0.16, 0.11, portrait), uArrive);
  float ii = uArrive * uArrive;
  vec2 q1 = vUv - vec2(0.5 - sep, ay);
  vec2 q2 = vUv - vec2(0.5 + sep, ay);
  q1.x *= uAspect;
  q2.x *= uAspect;
  float d1 = length(q1);
  float d2 = length(q2);
  float core = (1.0 - smoothstep(0.0, max(r, 1e-4), d1))
             + (1.0 - smoothstep(0.0, max(r, 1e-4), d2));
  core *= core;
  /* Halo ring softened on portrait, where its banding is most visible. */
  float halo = exp(-pow((d1 - r * 1.5) * 22.0, 2.0))
             + exp(-pow((d2 - r * 1.5) * 22.0, 2.0));
  halo *= mix(1.0, 0.5, portrait);
  col += ii * (core * vec3(1.0, 1.0, 0.96) * 1.2 + halo * AZURE * 0.25);

  /* HARD CAP: luminance <= 0.18, except headlight cores at uArrive > 0.9
     where the cap relaxes to 0.45 — text contrast always holds. */
  float coreMask = clamp(core, 0.0, 1.0);
  float cap = mix(0.18, 0.45, coreMask * smoothstep(0.9, 1.0, uArrive));
  float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col *= cap / max(l, cap);

  col *= uFade;

  /* Premultiplied output: composites as light over the CSS gradient. */
  float a = clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0);
  gl_FragColor = vec4(col, a);
}
`;

/* ShaderMaterial auto-declares position/uv/precision — only customs here. */
const TRAIL_VERT = /* glsl */ `
uniform float uTime;
uniform float uVelocity;
uniform float uArrive;
uniform float uAspect;
attribute vec4 aData;  /* t, lane jitter (y), size, phase */
attribute vec2 aData2; /* side (0|1), rand */
varying vec2 vQuv;
varying float vRand;

/* Flat cubic Bezier crossing the lower third (spec §2.2 b). On portrait
   the band shifts down (y -0.75..-0.55 vs -0.62..-0.40) so the additive
   streak clears the in-flow S1 body copy / S3 pull-quote. */
vec2 bz(float t, float a) {
  float m = 1.0 - step(0.8, a);
  vec2 p0 = vec2(-1.15 * a, mix(-0.62, -0.75, m));
  vec2 p1 = vec2(-0.30 * a, mix(-0.45, -0.60, m));
  vec2 p2 = vec2( 0.40 * a, mix(-0.58, -0.71, m));
  vec2 p3 = vec2( 1.15 * a, mix(-0.40, -0.55, m));
  float u = 1.0 - t;
  return u*u*u*p0 + 3.0*u*u*t*p1 + 3.0*u*t*t*p2 + t*t*t*p3;
}

void main() {
  float a = uAspect;
  /* Slow drift along t so the road is alive even at rest. */
  float t = fract(aData.x + uTime * (0.01 + 0.004 * aData.w));
  vec2 p = bz(t, a);
  vec2 tn = normalize(bz(min(t + 0.02, 1.0), a) - bz(t - 0.001, a));
  p.y += aData.y;

  float k = uArrive * uArrive; /* easeInQuad convergence */
  float len = aData.z * 4.0 * (1.0 + 14.0 * uVelocity) * (1.0 - 0.95 * k);
  float wdt = aData.z * (1.0 - 0.85 * k);

  /* Headlight anchors: UV (0.5 -/+ sep, ay) mapped to ortho world —
     dropped to UV y 0.16 (world -0.68) on portrait aspects, and the same
     aspect-aware separation as the sheen glows, so the trail convergence
     matches the glow centers exactly. */
  float sep = clamp(0.08 / min(a, 1.0), 0.08, 0.20);
  vec2 anchor = vec2(
    mix(-2.0 * sep, 2.0 * sep, aData2.x) * a,
    mix(-0.68, -0.44, step(0.8, a))
  );
  vec2 c = mix(p, anchor, k);

  vec2 nrm = vec2(-tn.y, tn.x);
  vec2 world = c + tn * position.x * len + nrm * position.y * wdt;

  vQuv = uv;
  vRand = aData2.y;
  gl_Position = vec4(world.x / a, world.y, 0.0, 1.0);
}
`;

const TRAIL_FRAG = /* glsl */ `
uniform float uVelocity;
uniform float uFade;
uniform float uArrive;
uniform float uTrailBase;
uniform float uTrailVel;
varying vec2 vQuv;
varying float vRand;

const vec3 AZURE = ${AZURE};

void main() {
  /* Soft-edged quad. Per-instance opacity comes from uniforms so touch
     viewports run much dimmer: with additive blending the overlapping
     band must never accumulate into a white bar across body copy. */
  float e = smoothstep(0.0, 0.5, vQuv.x) * smoothstep(1.0, 0.5, vQuv.x)
          * smoothstep(0.0, 0.5, vQuv.y) * smoothstep(1.0, 0.5, vQuv.y);
  vec3 col = mix(vec3(1.0), AZURE, vRand);
  float op = (uTrailBase + uTrailVel * uVelocity) * uFade * (1.0 - 0.6 * uArrive);
  gl_FragColor = vec4(col, e * op);
}
`;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Deterministic seeded PRNG (mulberry32) — stable instance layout. */
const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function Scene({
  progressRef,
  velocityRef,
  onContextLost,
}: SceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slot = hostRef.current;
    if (!slot) return;

    /* Create the canvas imperatively so every effect setup gets a FRESH
       element. With a JSX canvas, React StrictMode (dev) runs setup →
       cleanup → setup on the SAME node: the first cleanup's
       forceContextLoss() kills the shared canvas's context, the second
       setup inherits the dead context, and the async webglcontextlost
       event permanently flips ThreeStage to the gradient fallback. A fresh
       canvas per setup also hardens the prod IO unmount → remount path. */
    const canvas = document.createElement("canvas");
    Object.assign(canvas.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      display: "block",
    });

    const isMobile = window.innerWidth <= 767;
    const COUNT = isMobile ? 250 : 600;
    /* Touch viewports (mobile + tablet ≤991): the additive trail crosses
       the body-copy zone, so its per-instance opacity must stay low
       enough that fast-flick accumulation never approaches white
       (contrast ≥ 4.5:1 acceptance criterion, spec §2.2). */
    const isCompact = window.innerWidth <= 991;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false });
    } catch {
      onContextLost?.();
      return;
    }
    slot.appendChild(canvas);
    renderer.setClearColor(0x000000, 0);

    const scene = new ThreeScene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

    /* Single shared uniform store ({value} objects shared by reference). */
    const uniforms = {
      uSweep: { value: 0 },
      uFade: { value: 0 },
      uArrive: { value: 0 },
      uVelocity: { value: 0 },
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uTrailBase: { value: isCompact ? 0.04 : 0.1 },
      uTrailVel: { value: isCompact ? 0.2 : 0.55 },
    };

    /* (a) bodywork sheen — full-screen quad. */
    const sheenGeo = new PlaneGeometry(2, 2);
    const sheenMat = new RawShaderMaterial({
      vertexShader: SHEEN_VERT,
      fragmentShader: SHEEN_FRAG,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: CustomBlending,
      blendEquation: AddEquation,
      blendSrc: OneFactor /* premultiplied source */,
      blendDst: OneMinusSrcAlphaFactor,
    });
    const sheen = new Mesh(sheenGeo, sheenMat);
    sheen.frustumCulled = false;
    sheen.renderOrder = 0;
    scene.add(sheen);

    /* (b) the trail — instanced additive quads along the Bezier. */
    const trailGeo = new PlaneGeometry(1, 1);
    const rand = mulberry32(20260612);
    const data = new Float32Array(COUNT * 4);
    const data2 = new Float32Array(COUNT * 2);
    for (let i = 0; i < COUNT; i++) {
      data[i * 4 + 0] = rand(); /* t along the curve            */
      data[i * 4 + 1] = (rand() * 2 - 1) * 0.05; /* lane jitter  */
      data[i * 4 + 2] = 0.004 + rand() * 0.008; /* size          */
      data[i * 4 + 3] = rand(); /* phase                         */
      data2[i * 2 + 0] = i % 2; /* side — headlight anchor parity */
      data2[i * 2 + 1] = rand(); /* color rand                   */
    }
    trailGeo.setAttribute("aData", new InstancedBufferAttribute(data, 4));
    trailGeo.setAttribute("aData2", new InstancedBufferAttribute(data2, 2));
    const trailMat = new ShaderMaterial({
      vertexShader: TRAIL_VERT,
      fragmentShader: TRAIL_FRAG,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    const trail = new InstancedMesh(trailGeo, trailMat, COUNT);
    trail.frustumCulled = false;
    trail.renderOrder = 1;
    scene.add(trail);

    /* ---- sizing -------------------------------------------------- */
    let needsRender = true;
    const resize = () => {
      const w = slot.clientWidth || 1;
      const h = slot.clientHeight || 1;
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, window.innerWidth <= 767 ? 1.5 : 2)
      );
      renderer.setSize(w, h, false);
      const aspect = w / h;
      camera.left = -aspect;
      camera.right = aspect;
      camera.updateProjectionMatrix();
      uniforms.uAspect.value = aspect;
      needsRender = true;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(slot);

    /* ---- render loop (gsap.ticker, render-on-demand) -------------- */
    let running = false;
    /* Movement consumed by skipped frames must not be discarded: a slow
       scrub tail (< 0.0005/frame) would otherwise never accumulate to a
       render and freeze the sheen/arrive short of their scroll-mapped
       position. Accumulate the per-frame delta and only reset it when a
       frame actually renders. */
    let pending = 0;
    const tick = (_t: number, deltaTime: number) => {
      const p = progressRef.current;
      uniforms.uVelocity.value +=
        (velocityRef.current - uniforms.uVelocity.value) * 0.08;
      /* HomeStory only writes velocityRef inside ScrollTrigger's onUpdate,
         which stops firing when scrolling stops — decay it toward 0 every
         tick (frame-rate independent, ~8%/frame @60fps) so the
         render-on-demand gate below can engage once the scrub settles. */
      velocityRef.current *= Math.pow(0.92, deltaTime / 16.7);
      pending +=
        Math.abs(p.sweep - uniforms.uSweep.value) +
        Math.abs(p.fade - uniforms.uFade.value) +
        Math.abs(p.arrive - uniforms.uArrive.value);
      uniforms.uSweep.value = p.sweep;
      uniforms.uFade.value = p.fade;
      uniforms.uArrive.value = p.arrive;
      if (
        !needsRender &&
        pending < 0.0005 &&
        uniforms.uVelocity.value < 0.003
      ) {
        return; /* render-on-demand: nothing moved */
      }
      needsRender = false;
      pending = 0;
      uniforms.uTime.value += Math.min(deltaTime, 100) / 1000;
      renderer.render(scene, camera);
    };
    const setRunning = (run: boolean) => {
      if (run === running) return;
      running = run;
      if (run) gsap.ticker.add(tick);
      else gsap.ticker.remove(tick);
    };
    setRunning(true);

    /* Pause when the sticky slot leaves the viewport… */
    const io = new IntersectionObserver(([entry]) => {
      setRunning(entry.isIntersecting && document.visibilityState !== "hidden");
    });
    io.observe(slot);
    /* …or when the tab is hidden. */
    const onVisibility = () => {
      if (document.visibilityState === "hidden") setRunning(false);
      else {
        needsRender = true;
        setRunning(true);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    /* Context loss → tear down to the CSS-gradient fallback. */
    const onLost = (e: Event) => {
      e.preventDefault();
      onContextLost?.(); /* parent unmounts us → cleanup below runs */
    };
    canvas.addEventListener("webglcontextlost", onLost, false);

    /* ---- dispose (spec order) ------------------------------------ */
    return () => {
      setRunning(false);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost, false);
      scene.remove(sheen);
      scene.remove(trail);
      trail.dispose();
      sheenGeo.dispose();
      trailGeo.dispose();
      sheenMat.dispose();
      trailMat.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      slot.removeChild(canvas);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={hostRef}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    />
  );
}
