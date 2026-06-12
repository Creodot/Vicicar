# LANDING V2 — « LONGUE EXPOSITION » (spec définitive)

Single source of truth for everything below the hero on `app/page.tsx`.
Builders follow this literally. Hero (`components/Hero.tsx`) is UNTOUCHED.

Concept: the page below the hero is a night drive shot like a film — black
screens, end-credit Octane typography, numbered chapters (01–04), and ONE
continuous three.js light element (a long-exposure headlight trail + a
specular sweep over dark bodywork) that is the only "image" on the page.
The signature kinetic gesture is the Octane `wdth` axis stretching 0→100
(same move as the hero letters and AvisCta) — compressed type = a search
unresolved, full-width type = the car found. The trail's speed is the
user's scroll velocity; at the final CTA the trail converges into two
headlights emerging from the dark — your car arriving.

---

## 0. DEPENDENCIES & GLOBAL RULES

- `npm i three @types/three` (NEW — not in package.json yet). three core
  only, ES imports (`WebGLRenderer`, `OrthographicCamera`, `Scene`,
  `PlaneGeometry`, `InstancedMesh`, `ShaderMaterial`, `RawShaderMaterial`,
  `Color`, `InstancedBufferAttribute`). NO loaders, NO postprocessing, NO
  examples/ imports. Budget ≈ 115 kb gz, lazy-loaded (never in first paint).
- All new components: `"use client"`, GSAP via
  `import { gsap, useGSAP, outQuad, wfEase } from "@/lib/gsap"` and
  `import "./scroll"` (see §1). Every trigger/tween created inside
  `useGSAP(() => { ... }, { scope: rootRef })` — gsap.context reverts them.
  `ScrollTrigger.killAll()` is FORBIDDEN.
- Every animated branch lives in `gsap.matchMedia()`. Hidden initial states
  are applied ONLY inside `(prefers-reduced-motion: no-preference)` branches
  via `gsap.set`/`fromTo` — static markup is always the final, fully visible
  state (no-JS and reduced-motion users see complete content).
- REPO GOTCHA: never put 3D initial transforms in CSS and tween with `to()`.
  All transform initial states via `fromTo` with explicit `rotation: 0`.
  (Below the hero everything is 2D anyway — keep `rotation: 0` in every
  transform `fromTo` regardless.)
- No `/public` assets are added below the hero (type + shader only), so
  `asset()` is not needed in any new component. If that ever changes, wrap
  the path in `asset()` from `@/lib/asset`.
- Breakpoints: 991 / 767 / 479 (match globals.css). Mobile is designed,
  not shrunk: ZERO pins ≤991px, zero hover-dependent content anywhere.
- CLS zero: every section has a fixed `min-height`; GSAP only animates
  `transform`, `opacity`/`autoAlpha`, `clip-path`, and the `--wdth` CSS var
  (the only layout-affecting animation — see snapping rules per section).
- Both pins use `anticipatePin: 1` (Safari jump fix) and default
  `pinSpacing` (static-export markup unaffected).

### Scroll budget (below hero)

| Section | Desktop | Mobile (≤991, no pins) |
|---|---|---|
| S1 Manifesto | 100svh + pin 70vh = 1.70 | ~100svh |
| S2 Method | 100svh + pin 110vh = 2.10 | 3 × ~75svh ≈ 2.25 |
| S3 Proof | 100svh free = 1.00 | ~110svh |
| S4 FinalCta | 100svh free = 1.00 | 100svh |
| **Total** | **≈ 5.8 viewports** | **≈ 5.4 viewports** |

No smooth-scroll library (no Lenis). Native scroll + scrub.

---

## 1. FILE PLAN & PAGE ASSEMBLY

```
components/home/
  scroll.ts            ← copy of components/avis/scroll.ts pattern, verbatim:
                          registers ScrollTrigger once, exports { ScrollTrigger }
  HomeStory.tsx        ← client wrapper: sticky canvas slot + master ScrollTrigger
  HomeStory.module.css
  Manifesto.tsx        + Manifesto.module.css      (S1)
  Method.tsx           + Method.module.css         (S2)
  Proof.tsx            + Proof.module.css          (S3)
  FinalCta.tsx         + FinalCta.module.css       (S4)
  three/
    Beam.tsx           ← dynamic wrapper: next/dynamic(ssr:false) + IO mount
                          + capability gate + fallback (renders null)
    Scene.tsx          ← imperative three.js scene (geometry, shaders, loop)
components/avis/
  testimonials.ts      ← NEW: move the testimonial array out of
                          TestimonialList.tsx and export it (see §6.3)
```

`app/page.tsx` becomes:

```tsx
import Hero from "@/components/Hero";
import HomeStory from "@/components/home/HomeStory";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <HomeStory />   {/* renders Manifesto, Method, Proof, FinalCta */}
      <Footer />
    </>
  );
}
```

`HomeStory.tsx` structure:

```tsx
<div ref={wrap} className={styles.story}>          {/* position: relative */}
  <div className={styles.canvasSlot} aria-hidden>  {/* sticky, top:0, 100svh, z:0 */}
    <Beam progressRef={progressRef} velocityRef={velocityRef} />
  </div>
  <div className={styles.sections}>                {/* z-index: 1, margin-top: -100svh */}
    <Manifesto /> <Method /> <Proof /> <FinalCta />
  </div>
</div>
```

- `.canvasSlot`: `position: sticky; top: 0; height: 100svh; z-index: 0;
  pointer-events: none;`. The sections layer pulls up over it with
  `margin-top: -100svh` so the canvas sits behind ALL four sections.
- `.canvasSlot::before` carries the permanent base layer (always on, also
  the WebGL fallback): `background: radial-gradient(120% 60% at 70% 80%,
  var(--radial-glow) 0%, #000 60%);`. The canvas (alpha: true) draws light
  ON TOP of this gradient — if WebGL is missing the page still has depth.
- MASTER TRIGGER (in HomeStory's `useGSAP`, no-preference branch only):
  one ScrollTrigger — `trigger: wrap, start: "top bottom",
  end: "bottom bottom", scrub: 0.8` — scrubbing a timeline that tweens a
  plain proxy object `{ sweep: 0, fade: 0, arrive: 0 }` (read every frame
  by Scene via `progressRef`):

  | proxy key | range over master progress p | meaning |
  |---|---|---|
  | `fade`  | 0→1 over p 0.00–0.06 · hold 1 · 1→0.35 over 0.60–0.66 · 0.35→1 over 0.78–0.86 | canvas master opacity (dims for the S3 "breath", returns for S4) |
  | `sweep` | 0→1 over p 0.05–0.65, ease "none" | specular streak position across S1+S2 |
  | `arrive`| 0→1 over p 0.84–0.98, ease "none" | trail converges into two headlights under S4 |

  Same trigger's `onUpdate`: `velocityRef.current = clamp(|self.getVelocity()| / 3000, 0, 1)`
  (Scene lerps it internally at 0.08/frame → trail elongation).
- Reduced-motion branch: no master trigger; `Beam` is not mounted at all
  (gate in §2) — the gradient base layer is the whole backdrop.

---

## 2. THREE.JS — « LE FAISCEAU » (components/home/three/)

### 2.1 Beam.tsx (dynamic wrapper — the only file imported by HomeStory)

- `const Scene = dynamic(() => import("./Scene"), { ssr: false });`
- Mount gate (ALL must pass, checked client-side):
  1. IntersectionObserver on the HomeStory wrapper, `rootMargin: "100% 0px"`
     — Scene loads while the user approaches S1, after hero videos settle.
     Unmount + dispose when scrolled > 150% past the wrapper.
  2. `!matchMedia("(prefers-reduced-motion: reduce)").matches`
  3. WebGL available: `!!document.createElement("canvas").getContext("webgl2") || ("webgl")`
     wrapped in try/catch.
  4. `(navigator.deviceMemory ?? 8) > 2`
- Any gate fails → render `null` (the CSS gradient base layer is the
  fallback; content never depends on the canvas).
- Props: `progressRef`, `velocityRef` (mutable refs, no re-renders).

### 2.2 Scene.tsx — geometry & shaders (everything procedural, zero textures)

Camera: `OrthographicCamera(-aspect, aspect, 1, -1, 0, 1)` — pure 2D layers.
Renderer: `WebGLRenderer({ canvas, alpha: true, antialias: false })`,
`setClearColor(0x000000, 0)`,
`setPixelRatio(Math.min(devicePixelRatio, innerWidth <= 767 ? 1.5 : 2))`.

**(a) The bodywork sheen** — one full-screen quad (`PlaneGeometry(2,2)`,
`RawShaderMaterial`, vertex passes position straight through).
Fragment shader:
- Procedural normal field: 3 octaves of value noise, UV stretched 8:1
  horizontally (brushed-metal / curved-panel feel), subtle vertical bow
  (`uv.y += 0.15 * sin(uv.x * 2.2)`) so it reads as a fender, not a wall.
- Lit by ONE anisotropic GGX-style streak whose center slides diagonally
  from bottom-left (uSweep=0) to top-right (uSweep=1):
  `streakPos = mix(vec2(-0.3, 0.15), vec2(1.3, 0.85), uSweep)`.
- Highlight color: `mix(vec3(1.0), AZURE /* #d9e9e9 */, smoothstep(0.3, 0.9, uSweep))`.
- Two headlight glows (the S4 payoff, no extra geometry): radial falloffs at
  `vec2(0.42, 0.28)` and `vec2(0.58, 0.28)` (screen UV), radius
  `mix(0.0, 0.16, uArrive)`, intensity `uArrive * uArrive`, additive into
  the fragment, slight azure halo ring.
- HARD CAP: final fragment luminance ≤ 0.18 except inside the headlight
  cores at uArrive > 0.9 (cap 0.45 there) — text contrast must always hold.
- Multiply everything by `uFade`.

**(b) The trail** — `InstancedMesh` of `PlaneGeometry(1, 1)`:
**600 instances desktop / 250 ≤767px**. `ShaderMaterial`,
`blending: AdditiveBlending`, `transparent: true`, `depthWrite: false`.
- Instances distributed (deterministic seeded random) along a flat cubic
  Bézier crossing the lower third of the screen:
  P0(-1.15·a, -0.62) P1(-0.3·a, -0.45) P2(0.4·a, -0.58) P3(1.15·a, -0.40)
  (a = aspect), each instance carrying attributes: t (curve param), lane
  jitter (±0.05 y), size (0.004–0.012), phase, side (0|1 for headlight
  anchor parity).
- Vertex shader: orient each quad along the curve tangent; length =
  `baseLen * (1.0 + 14.0 * uVelocity)`; drift instances slowly along t
  (`t += uTime * 0.01`, wrapped mod 1) so the road is alive even at rest.
  Convergence: `pos = mix(curvePos, anchor[side], easeInQuad(uArrive))`
  where anchors = the two headlight UV points mapped to world; as uArrive→1
  the streaks pour into the headlights and shrink to points.
- Fragment: soft-edged quad (smoothstep on local UV), color
  `mix(vec3(1.0), AZURE, instanceRandom)`, opacity
  `(0.10 + 0.55 * uVelocity) * uFade * (1.0 - 0.6 * uArrive)`.

**Uniforms** (single shared object): `uSweep, uFade, uArrive, uVelocity,
uTime, uAspect`. Per tick: `uVelocity += (velocityRef.current - uVelocity) * 0.08`,
then copy `progressRef.current.{sweep,fade,arrive}` in.

**Render loop**: driven by `gsap.ticker.add(render)`. Render-on-demand:
skip `renderer.render` when (uniform deltas < 0.0005 AND uVelocity < 0.003).
Pause entirely (`gsap.ticker.remove`) on the IO leaving the wrapper and on
`document.visibilitychange === "hidden"`; resume on return.

**Resize**: single `ResizeObserver` on the canvas slot → renderer.setSize,
camera left/right = ±aspect, uAspect.

**Dispose** (useEffect cleanup, in order): ticker remove, IO/RO disconnect,
geometry.dispose() ×2, material.dispose() ×2, renderer.dispose(),
`renderer.forceContextLoss()`, drop all refs.

`webglcontextlost` event → prevent default, tear down to the null fallback
(do not attempt restore — the gradient is fine).

---

## 3. TYPOGRAPHY SCALE & SPACING RHYTHM (new sections)

All anchored to existing tokens. The `--wdth` pattern is EXACTLY
AvisCta.module.css's: CSS declares
`font-variation-settings: "wght" <w>, "wdth" var(--wdth, 100);`
and GSAP tweens the `--wdth` custom property (default 100 = no-JS safe).

| Role | Font | Size | Settings |
|---|---|---|---|
| Chapter label | Oak, `.label` class (globals) | 0.8em | as-is; opacity 1, color --heading |
| Display XL (S1 lines) | Octane | `clamp(3.2rem, 11vw, 10.5rem)` / mobile 13.5vw | `"wght" 550, "wdth" var(--wdth,100)`, line-height 0.98, color --heading, uppercase |
| Giant digit (S2) | Octane | desktop `38vh`, mobile `30vw` | `"wght" 550`, `color: transparent`, `-webkit-text-stroke: 1px var(--border)` |
| Frame headline (S2 h3) | Octane | globals h3 (2.37em → 1.7em ≤767) | `"wght" 550` (globals default) |
| Stat figure (S3) | Octane | `clamp(4rem, 8.5vw, 9rem)` / mobile 22vw | `"wght" 550`, transparent fill, `-webkit-text-stroke: 1px var(--border)` |
| Pull-quote (S3) | Oak italic | `clamp(1.4em, 2.6vw, 2.1em)` / mobile 1.3em | color --heading, line-height 1.45 |
| CTA word (S4) | Octane | `clamp(6rem, 18vw, 17rem)` / mobile 22vw | `"wght" 550, "wdth" var(--wdth,100)`, color --heading |
| Body copy | Oak | globals p (1.1em / 1.7) | color --paragraphs |

Spacing rhythm:
- Horizontal gutter everywhere: `padding-inline: clamp(1.5rem, 5vw, 4rem)`
  (mobile resolves to 1.5rem).
- Chapter labels sit at `top: clamp(5rem, 12vh, 7rem)` (clears the fixed
  glass navbar), left gutter; they are part of each section, not sticky.
- Vertical rhythm inside sections: multiples of `1.3em` (matches globals
  list/blockquote rhythm); gap between display type and body ≥ `2.6em`.
- Separators: always `1px solid var(--border)`.
- Glass surfaces (S4 button only below the hero): `background: var(--glass);
  backdrop-filter: blur(30px); border: 1px solid var(--border);
  border-radius: 1em;` — ≤1 simultaneous backdrop-filter below the fold.

---

## 4. S1 — MANIFESTO (`components/home/Manifesto.tsx`) — « 01 — LE SERVICE »

The required one-striking-statement.

### Copy (final)
- Label: `01 — LE SERVICE`
- Lines (one element per line, uppercase):
  - `VOUS DÉCRIVEZ.`
  - `ON DÉNICHE.`
  - `ON NÉGOCIE.`
- Body (max-width 34ch): `Vicicar est un service de recherche automobile
  sur-mesure. Un expert dédié déniche, vérifie et négocie votre prochaine
  voiture à votre place — et cela ne vous coûte rien.`
- Anchor link (NavLink underline-sweep style): `Découvrir la méthode ↓`
  → `href="#methode"` (plain anchor).

### Layout
- Desktop: `min-height: 100svh`, transparent background (canvas behind).
  Label top-left. The three lines stacked, left-aligned, the block centered
  vertically, ragged like film credits (line 2 indented `4vw`, line 3 `1.5vw`).
  Body bottom-right (absolute, bottom gutter), link bottom-left.
- Mobile ≤767: lines at 13.5vw in the top half (no indents), body below in
  flow, link under it. `min-height: 100svh`.

### Choreography
Desktop — `(prefers-reduced-motion: no-preference) and (min-width: 992px)`:
- Pin: `trigger: section, start: "top top", end: "+=70%", scrub: 0.7,
  pin: true, anticipatePin: 1`, one timeline.
- Each line `fromTo({ "--wdth": 0, autoAlpha: 0.15, x: "2vw", rotation: 0 },
  { "--wdth": 100, autoAlpha: 1, x: 0, ease: "none" })`, line i starts at
  position `i * 0.18` of the timeline, each segment 0.45 long. Snap the
  layout cost: tween `--wdth` through a quantizer
  (`modifiers: { "--wdth": gsap.utils.snap(2) }`) so at most one line
  relayouts per frame, in 2-unit steps.
- Body + link: last 25% of the timeline, `fromTo({ autoAlpha: 0, y: 30,
  rotation: 0 }, { autoAlpha: 1, y: 0, ease: wfEase })`, link offset +0.05.
- (Canvas: master `sweep` passes ~0.18 here — the sheen crosses behind
  « ON DÉNICHE. ». No section-local canvas code.)

Mobile — `(prefers-reduced-motion: no-preference) and (max-width: 991px)`:
- No pin. One trigger `start: "top 75%", once: true`:
  lines `fromTo({ autoAlpha: 0, y: 24, "--wdth": 40, rotation: 0 },
  { autoAlpha: 1, y: 0, duration: 0.9, ease: outQuad, stagger: 0.15 })`
  with `--wdth → 100` as a parallel tween `duration: 1.6, ease: "power3.out"`
  (the AvisCta signature, fired once). Body+link `autoAlpha/y 24→0, 0.9s,
  wfEase` at +0.3.

Reduced-motion (all widths): nothing hidden, no pin, no triggers —
static markup already shows `--wdth` 100 (CSS default) and full opacity.

---

## 5. S2 — METHOD (`components/home/Method.tsx`) — « 02 — LA MÉTHODE »

`id="methode"`. Three "frames" cross-fading in place like cut titles.

### Copy (final)
- Persistent label: `02 — LA MÉTHODE · COMMENT ÇA MARCHE`
- Frame 1 — digit `01` — h3 `Décrivez votre besoin` — body `Budget, usage,
  envies. Trois minutes suffisent pour dresser le portrait de votre voiture
  idéale.` — micro-label `≈ 3 MINUTES`
- Frame 2 — digit `02` — h3 `Un expert vous appelle` — body `Un spécialiste
  — pas un algorithme — vous rappelle pour affiner chaque critère avec
  vous.` — micro-label `SOUS 24 H`
- Frame 3 — digit `03` — h3 `Recevez votre sélection` — body `Nous
  dénichons, vérifions l'historique et négocions le prix. Vous n'avez plus
  qu'à choisir.` — micro-label `0 € — TOUJOURS`

### Layout
- Markup is ALWAYS the stacked vertical list (accessible/no-JS truth).
  Desktop motion layout is CSS-gated:
  `@media (min-width: 992px) and (prefers-reduced-motion: no-preference)
  { .frames { display: grid; } .frame { grid-area: 1 / 1; } }` — frames
  stack in one grid cell only when the crossfade will actually run.
- Each frame (desktop): giant outlined digit 38vh, right-anchored,
  `transform: translateX(8%)` clipped by the viewport edge (overflow hidden
  on the section); inside the digit a nested `<span>` duplicate with
  `color: var(--heading)` and `clip-path: inset(100% 0 0 0)` (the fill
  layer). Left column (max-width 30ch): micro-label, h3, body.
- Progress hairline: 1px wide, full section height, at the left gutter:
  track `var(--border)`, fill child `var(--azure)` scaling.
- Mobile: three stacked blocks, each `min-height: 75svh`, digit as a 30vw
  watermark behind the text (right-bleeding, opacity 0.5), text left.

### Choreography
Desktop — `(min-width: 992px) and (prefers-reduced-motion: no-preference)`:
- Pin: `start: "top top", end: "+=110%", scrub: 0.7, pin: true,
  anticipatePin: 1`. One timeline, three equal thirds. For frame i
  (third spanning [i/3, (i+1)/3] of the timeline):
  - incoming digit: `fromTo({ autoAlpha: 0, xPercent: 16, rotation: 0 },
    { autoAlpha: 1, xPercent: 8 })` over the first 30% of the third
    (frame 1 starts already visible at timeline 0 via a 0-duration set);
  - digit fill: `clip-path: inset(100% 0 0 0)` → `inset(0% 0 0 0)` across
    the middle 60% of the third — the number "fills with light" while
    active;
  - text column (micro-label, h3, body): `fromTo({ autoAlpha: 0, y: 36,
    rotation: 0 }, { autoAlpha: 1, y: 0, stagger: 0.06 })` in the first
    35% of the third;
  - outgoing frame (i−1): `to({ autoAlpha: 0, xPercent: -4 })` over the
    first 25% of the third.
  - Frame 3 never exits (holds to pin end).
- Hairline fill: `fromTo(scaleY 0 → 1, transformOrigin "top", ease "none")`
  across the entire pin — the only persistent motion cue.
- (Canvas: master `sweep` runs ~0.3→0.65 here — the streak crosses the
  giant digits like light over sheet metal; trail `uVelocity` is naturally
  most visible in this fast-scrub zone.)

Mobile — `(max-width: 991px) and (prefers-reduced-motion: no-preference)`:
- No pin. Per block, `start: "top 78%", once: true`:
  `fromTo({ autoAlpha: 0, y: 32, rotation: 0 }, { autoAlpha: 1, y: 0,
  duration: 0.8, ease: outQuad })`; digit fill clip-path animated once,
  `duration: 1.2, ease: "power3.out"`, at +0.2.

Reduced-motion: stacked layout (CSS default), everything visible, digits
shown with fill layer at `inset(0)` (CSS default state IS filled; the
no-preference branches `gsap.set` it to `inset(100% 0 0 0)` before
animating — never hide in CSS).

---

## 6. S3 — PROOF (`components/home/Proof.tsx`) — « 03 — LA PREUVE »

Free-flowing — the breath after two pins. Canvas dims to 0.35 behind it
(master `fade`), no section-local canvas logic.

### 6.1 Copy (final)
- Label: `03 — LA PREUVE`
- Stats row (figure + `.label` caption):
  - `100 %` / `GRATUIT, SANS EXCEPTION`
  - `+250` / `VOITURES TROUVÉES`
  - `4,9/5` / `NOTE DE NOS CLIENTS`
- Pull-quote: `« Un vrai humain au téléphone, qui pose les bonnes
  questions. Pas de jargon, pas de pression. »`
- Quote meta (`.label`, is a Link to `/avis`):
  `KARIM B. — EXTRAIT DE NOS AVIS · VOIR TOUS LES AVIS →`

### 6.2 Layout
- Desktop: `min-height: 100svh`, vertically centered column. Stats: full
  width row of 3 equal cells separated by 1px `var(--border)` verticals;
  figure (outlined Octane per §3) with caption `.label` beneath, both
  centered in the cell. Below (gap 4em): the pull-quote centered,
  max-width 56ch, then the meta link.
- Mobile: cells stack vertically with 1px horizontal separators, figure
  22vw left-aligned + caption right-aligned on the same baseline row;
  quote 1.3em, left-aligned.

### 6.3 Data — single source of truth
Refactor: move the testimonial array out of
`components/avis/TestimonialList.tsx` into a new
`components/avis/testimonials.ts` that exports `TESTIMONIALS` (same shape,
same content, zero copy changes). `TestimonialList.tsx` imports it.
`Proof.tsx` imports it too and derives the pull-quote:

```ts
export const HOME_PULL_QUOTE = {
  text: "« Un vrai humain au téléphone, qui pose les bonnes questions. Pas de jargon, pas de pression. »",
  name: "Karim B.", // = TESTIMONIALS[1] — the displayed text is the first
                    // two sentences of that quote; keep them in sync.
};
```

(Stat values `100`, `250`, `4.9` are constants in Proof.tsx.)

### 6.4 Choreography
- Static markup renders the FINAL figures (`100 %`, `+250`, `4,9/5`) —
  they ARE the no-JS/reduced-motion state.
- No-preference (all widths — count-up is cheap), one trigger
  `start: "top 75%", once: true`, single timeline:
  - cells: `fromTo({ autoAlpha: 0, y: 50, rotation: 0 },
    { autoAlpha: 1, y: 0, duration: 0.9, ease: outQuad, stagger: 0.12 })`;
  - count-ups in parallel per cell (offset by the same 0.12 stagger):
    gsap proxy `{ v: 0 }` → target, `duration: 1.6, ease: outQuad`,
    `onUpdate` writes textContent — `100` with `snap: 1` (render `${v} %`),
    `250` with `snap: 1` (render `+${v}`), `4.9` with `snap: 0.1` (render
    `${v.toFixed(1).replace(".", ",")}/5`);
  - quote + meta: `fromTo({ autoAlpha: 0, y: 28, rotation: 0 },
    { autoAlpha: 1, y: 0, duration: 1, ease: wfEase, stagger: 0.1 })`
    at +0.5. (No text splitting — repo gsap 3.12 has no free SplitText.)
- Reduced-motion: no triggers, nothing hidden.

---

## 7. S4 — FINALCTA (`components/home/FinalCta.tsx`) — « 04 — À VOUS »

The climax: behind this section the trail converges into two headlights
(master `arrive` 0→1 over p 0.84–0.98) — the car arriving — while the CTA
word performs the hero's wdth-stretch one last time, closing the loop.

### Copy (final)
- Label (top-center): `04 — À VOUS`
- CTA word (h2): `ALLEZ-Y.`
- Button (Link → `/trouver-ma-voiture`): `TROUVER MA VOITURE — GRATUIT`
- Sub-line (p): `3 minutes pour décrire votre besoin. Un expert vous
  rappelle sous 24 h.`

### Layout
- Desktop: `min-height: 100svh`, centered column: label · ALLEZ-Y.
  (per §3, `--wdth` var) · button pill (glass per §3, `.label` typography
  at 1em, `padding: 1.2em 3em`) · sub-line (max-width 38ch, centered).
  Gap rhythm: 2.6em / 1.3em.
- Mobile: word 22vw; button `width: calc(100% - 3rem)`, centered,
  `min-height: 56px` tap target; sub-line 0.95em.
- Hover (`@media (hover: hover) and (pointer: fine)` only, CSS):
  button background → `var(--glass-active)`; the word gets a light-sweep —
  `background: linear-gradient(100deg, var(--heading) 40%, var(--azure) 50%,
  var(--heading) 60%) 200%/200% no-repeat; -webkit-background-clip: text;`
  with `background-position` transitioned to 0% over 1.2s
  `var(--ease-out-quart)`. Touch devices simply never see it (the entrance
  animation is the moment instead — no hover-gated content).

### Choreography
- No pin. No-preference (all widths), one trigger
  `start: "top 70%", once: true`, timeline:
  - word: `fromTo({ autoAlpha: 0, "--wdth": 0 }, { autoAlpha: 1,
    duration: 1, ease: wfEase }, 0)` + parallel
    `to({ "--wdth": 100, duration: 2, ease: "power3.out" }, 0)` —
    the exact AvisCta gesture (and the hero's), at maximum scale;
  - button: `fromTo({ autoAlpha: 0, y: 24, rotation: 0 },
    { autoAlpha: 1, y: 0, duration: 0.9, ease: wfEase }, 0.35)`;
  - sub-line: same values at 0.5.
- Reduced-motion: everything visible, `--wdth` 100 (CSS default), no
  canvas (gradient backdrop only). Button fully functional.

`<Footer />` follows immediately in `app/page.tsx` (after the HomeStory
wrapper — the sticky canvas has already scrolled away; footer sits on
flat black).

---

## 8. ACCEPTANCE CHECKLIST

- [ ] `next build` static export passes; page works from `out/` under
      `/Vicicar` base path (no new `/public` assets, so no `asset()` risk).
- [ ] Total scroll below hero ≤ 6 viewports desktop (measured ≈ 5.8),
      zero pins ≤991px and under reduced-motion.
- [ ] With `prefers-reduced-motion: reduce`: all copy visible without
      scrolling tricks, correct final stat values, no canvas, no pins.
- [ ] With JS disabled: identical full content on the gradient backdrop.
- [ ] DevTools WebGL kill-switch → gradient fallback, zero console errors.
- [ ] No ScrollTrigger leaks on route change (navigate home → /avis →
      home twice; trigger count returns to baseline). No `killAll`.
- [ ] Canvas: DPR ≤ 2 (1.5 mobile), rAF idle when tab hidden or wrapper
      off-screen, memory flat after unmount (dispose verified).
- [ ] Text over canvas: contrast ≥ 4.5:1 for body copy at all sweep
      positions (sheen luminance cap 0.18 enforced in shader).
- [ ] Lighthouse: LCP unchanged (hero untouched), CLS = 0, added route
      JS ≤ 150 kb gz and lazy (three chunk absent from first paint).
- [ ] 375px / 768px / 1024px / 1440px pass design review as intentional
      layouts (not scaled desktop).
