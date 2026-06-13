# Landing v3 — « Plein phare »

The definitive spec for the below-hero landing rebuild. Video-led, cinematic,
built from Vicicar's seven owned car loops + the existing Octane/Oak type
system. Replaces ALL of `components/home/*` v2 (HomeStory / Manifesto /
Method / Proof / FinalCta / three/) with `components/home/v3/*`.

> **ANTI-COPY RULE (header, binding).** Techniques in this page are *inspired*
> by the Longbow reference (`_reference/spec/longbow-inventory.md`): Lenis
> feel, full-bleed video scenes, viewport-beat rhythm, line sweeps, marquees,
> masked line reveals, sticky+scrub swells. ZERO copied copy, imagery, video,
> logos, or layout-verbatim. Specifically banned: Longbow's 25 % blueprint
> grid + square registration marks, the Bebas/Garamond roman↔italic voice,
> the preloader square ritual, the cursor-following pill, their grey body,
> any of their words. Every word below is original French; every frame is our
> footage; every layout is composed for portrait 9:16 loops (theirs are
> landscape) — structurally different by construction.

---

## 0. The one design fact that shapes everything

All seven loops are **405 × 720 portrait (9:16), ~3.2–3.6 s**, graded dark:

| File | Content (poster-verified) | Personality |
|---|---|---|
| `V` | dark sedan side profile, industrial loft, hanging lamps | establishing, calm, "the car, presented" |
| `I` | red berline front 3/4, **headlights blazing at camera** | the payoff. THE shot the WebGL faked |
| `C` | extreme close-up headlight glass / silver bodywork in motion | abstract glint texture, "inspection" |
| `I2` | near-black rear, thin **red LED light-bar** glowing | mystery, the car not yet found |
| `C3` | abstract red/pink tail-light **bokeh orbs** | pure light texture — glass/hover material |
| `A2` | white roadster rear, garage, plate visible | concrete, human-scale, "found & parked" |
| `R` | dark hatchback front, badge + **French plate (76)** | authenticity — real cars, real France |

Consequence: **never stretch a loop full-bleed-cover on desktop** (4.7×
upscale at 1920 w = mush; an awwwards jury sees it instantly). Instead:

- **Desktop**: loops live as **sharp portrait panels / film-strips at near-
  native scale** (a 100 vh-tall 9:16 panel ≈ 506 px wide at 900 px viewport
  height ≈ 1.25× upscale — crisp). Where we want full-bleed *light*, a
  second, heavily **blurred copy of the same loop fills the viewport behind
  the sharp panel** (blur(2.5rem) erases upscaling entirely) + a noise
  overlay (`opacity:.12`) to de-band. "Sharp core, blurred halo."
- **Mobile (≤767, portrait)**: the loops are NATIVE full-bleed. `object-fit:
  cover` = true cinema. Mobile gets the most immersive version of the page,
  not a degraded one.

This portrait-panel grammar is also our strongest divergence from Longbow.

---

## 1. Page composition (order, beats, scroll budget)

`app/page.tsx` (server component) becomes:

```tsx
<main>
  <Hero />                       // UNTOUCHED
  <SmoothScroll />               // v3 — Lenis, landing-only, renders null
  <Manifeste />                  // 01 — LE SERVICE      ~160 vh  (impact: swell)
  <MarqueeBand />                // breath                ~35 vh  (type only)
  <Methode />                    // 02 — LA MÉTHODE      ~280 vh  (impact: step machine)
  <Preuve />                     // 03 — LA PREUVE       ~100 vh  (quiet editorial)
  <FinalCta />                   // 04 — À VOUS          ~100 vh  (impact: headlights)
</main>
<Footer />                       // UNTOUCHED
```

≈ **675 vh below hero ≈ 6.75 viewports** (budget 6–8 ✓). Tempo alternates
**film / type / film / quiet / film** — no two consecutive sections share a
recipe (kills the v2 monotone). The **first scroll** lands inside the
Manifeste swell with the V loop already moving → WOW within one wheel tick.

Section seams: each section (except Manifeste, which flows out of the hero)
carries a top `1px` hairline in `--border` that **line-sweeps** `scaleX 0→1`
on first reveal (0.5 s, `power1.inOut`, alternating `transformOrigin`
left/right per section). Hairlines as seams ONLY — no vertical page grid, no
square markers (anti-copy).

Chapter spine preserved verbatim from v2: small `.label` top-left at the
same inset on every chapter: `01 — LE SERVICE` · `02 — LA MÉTHODE · COMMENT
ÇA MARCHE` · `03 — LA PREUVE` · `04 — À VOUS`.

Loop→scene map (every loop gets exactly one job):

| Scene | Loop(s) | Role |
|---|---|---|
| Manifeste | **V** | sharp swelling panel |
| Methode | **I2 → C → A2** | one per step: unknown → inspection → found |
| Preuve | **R** | authenticity panel (French plate) |
| FinalCta | **I** (+ blurred **I** halo) | headlights payoff |
| Hover glass (Preuve link + CTA button) | **C3** | bokeh "living glass" light source |

---

## 2. Scenes

### 2.1 `Manifeste` — « 01 — LE SERVICE » (~160 vh, the first-scroll WOW)

**Copy (verbatim from v2 — keep):**
- Label: `01 — LE SERVICE`
- H2 tricolon (3 lines): `VOUS DÉCRIVEZ.` / `ON DÉNICHE.` / `ON NÉGOCIE.`
- Body: `Vicicar est un service de recherche automobile sur-mesure. Un expert
  dédié déniche, vérifie et négocie votre prochaine voiture à votre place —
  et cela ne vous coûte rien.`
- Link: existing `<NavLink href="#methode" label="Découvrir la méthode ↓" />`

**Desktop (≥992):**
- Section `height: min(160dvh, 100rem)`; inner stage `position: sticky; top: 0;
  height: 100dvh` (CSS sticky — **never ScrollTrigger pin**, no pin-spacer,
  no Lenis fight). Black stage.
- Center: **V panel**, `aspect-ratio: 9/16`, sized to `height: 100dvh` at
  scale 1, `object-fit: cover`, `filter: brightness(.78)`, framed by a 1px
  `--border` hairline. **Swell scrub** (the Longbow gallery technique,
  rotated to portrait): `fromTo(panel, {scale:.55, rotation:0},
  {scale:1, rotation:0, ease:"none"})` with
  `scrollTrigger {trigger: section, start:"top 60%", end:"bottom bottom",
  scrub: 1}` — transform-only (60 fps; we scale, we don't tween height).
  Hairline frame fades `autoAlpha 1→0` over the last 20 % of the scrub.
- Tricolon composited **OVER and WIDER than** the panel — white Octane lines
  crossing black + moving video (the resting frame is art-directed: full
  opacity always, no v2 ghost-alpha). Layout: 3 left-aligned lines, the
  block centered vertically, left edge at the global content inset.
- **wdth stretch scrub** (brand gesture over video, per audit): each line's
  `font-variation-settings: 'wdth' var(--wdth)`; a scrubbed timeline tweens
  `--wdth` per line 0→100 across section progress windows **0.05–0.35 /
  0.25–0.60 / 0.45–0.85** (`ease:"none"` on the scrub; value interpolation
  linear). Lines not yet stretched rest at wdth 0 — condensed but fully
  white/legible.
- Entrance (triggered once, `start:"top 75%"`): label fades (`wfEase`,
  0.5 s); lines masked-rise `fromTo({yPercent:110, rotation:0},
  {yPercent:0, rotation:0, duration:.8, ease:"power2.out", stagger:.14})`
  inside `overflow:clip` mask spans; body + link masked per-line rise
  (duration 1, stagger .12, power2.out) at +0.4 s.

**Mobile (≤991):**
- No sticky, no scrub. Section `min-height: 100svh`, auto. **V full-bleed
  cover behind everything** (native portrait — perfect), `brightness(.7)`,
  bottom `linear-gradient(transparent, var(--background))` for the seam.
- Tricolon stacked, `clamp` smaller (see §6); entrance = same masked rises
  (one-shot via IO), then each line stretches wdth 0→100 by **CSS
  transition** `font-variation-settings 3s outQuartCss` (class toggle,
  stagger 0.25 s) — the hero's own interruptible mechanism.

**Reduced motion:** static markup IS this state — lines at wdth 100, full
opacity, no sticky/scrub, video shows `V-poster.jpg` (plays only on tap).

### 2.2 `MarqueeBand` — typographic breath (~35 vh)

No media, no chapter number — a palate cleanser between two film scenes.

**Copy (new, original):**
- Giant strip: `VOTRE VOITURE — ` (repeated by clone math)
- Mono strip: `GRATUIT · SUR-MESURE · EXPERT DÉDIÉ · RÉPONSE SOUS 24 H · `

**Desktop:** hairline, then giant Octane marquee (uppercase, **wdth 100**,
`clamp(6rem, 12vw, 12rem)`, `line-height:.85`), then hairline, then the mono
`.label`-style strip (0.75 rem, `--paragraphs`), then hairline. CSS keyframes
`translateX(0 → -50%)` linear infinite (right-to-left — opposite drift to
Longbow); mono strip runs the **other way** for tension. JS measures content,
clones `2 × ceil(container/content)` copies, sets `animation-duration =
copies × 6s` (giant) / `copies × 10s` (strip); ResizeObserver re-runs.
Marquees start `animation-play-state: paused` until the band's line-sweeps
finish (reveal first, motion second).

**Mobile (≤767):** giant marquee `display:none`, replaced by static centered
`VOTRE VOITURE.` (Octane, `clamp(3.2rem, 13vw, 5.5rem)`, wdth 100); the mono
strip stays animated — the one moving thing (Longbow's mobile lesson).

**Reduced motion:** both static (`animation: none`), giant shows the static
variant at every width. Shared component: **yes** — `Marquee.tsx` (see §4).

### 2.3 `Methode` — « 02 — LA MÉTHODE » (~280 vh, the step machine) `id="methode"`

**Copy (verbatim from v2 — keep all of it):**

| # | micro | title | body |
|---|---|---|---|
| 01 | `≈ 3 MINUTES` | `Décrivez votre besoin` | `Budget, usage, envies. Trois minutes suffisent pour dresser le portrait de votre voiture idéale.` |
| 02 | `SOUS 24 H` | `Un expert vous appelle` | `Un spécialiste — pas un algorithme — vous rappelle pour affiner chaque critère avec vous.` |
| 03 | `0 € — TOUJOURS` | `Recevez votre sélection` | `Nous dénichons, vérifions l'historique et négocions le prix. Vous n'avez plus qu'à choisir.` |

Heading (h2.label): `02 — LA MÉTHODE · COMMENT ÇA MARCHE`. Step→loop
narrative: **01 = I2** (black rear, red light-bar — the car still unknown),
**02 = C** (headlight close-up — the expert inspects), **03 = A2** (white
roadster parked — found, delivered).

**Desktop (≥992):**
- Section `height: 280vh`; sticky inner `100dvh`. 12-col grid: text cols
  1–5, **media panel** cols 7–12: `aspect-ratio: 9/16`, `height: 80vh`,
  right-anchored, hairline-framed, three stacked `<video>`s absolutely
  positioned inside (only the active one visible/playing).
- **Giant outlined digit** (kept from v2): `01/02/03`, Octane,
  `clamp(12rem, 20vw, 20rem)`, `-webkit-text-stroke: 1px #fff3`,
  `color: transparent`, anchored to the viewport's right edge and **bleeding
  off it** (`right: -.18em`), layered OVER the video panel — typographic
  watermark on moving paint.
- **Step machine** (triggered-within-sticky, NOT scrubbed — robust in both
  directions): one ScrollTrigger `{trigger: section, start:"top top",
  end:"bottom bottom", onUpdate}` maps progress → `active = ⌊p×3⌋` (clamped
  0–2). On change, play a 0.7 s swap timeline:
  - incoming video wipes over the outgoing: `clip-path: inset(100% 0 0 0) →
    inset(0% 0 0 0)` going down (from the top, `inset(0 0 100% 0)→…`, going
    up), 0.7 s `power2.inOut`; outgoing pauses post-wipe (manager, §4).
  - text out: micro/title/body masked rise OUT `yPercent: -110`, 0.35 s
    `power2.in`; in: `fromTo({yPercent:110, rotation:0}, {yPercent:0,
    rotation:0, duration:.5, ease:"power2.out", stagger:.08})`.
  - digit: out `autoAlpha→0, yPercent→-25`, 0.4 s; in `fromTo({yPercent:30,
    autoAlpha:0, rotation:0}, {yPercent:0, autoAlpha:1, rotation:0,
    duration:.6, ease:"power2.out"})`.
  - micro label flips to `--azure` for the active step (the only color).
- **Progress rail**: 2 px vertical line left of the text column, `scaleY`
  scrubbed 0→1 (`ease:"none"`) over the section — the line-sweep motif as
  wayfinding (replaces v2's dead pin-time with legible progress).

**Mobile (≤991):** no sticky. Three stacked blocks, each: hairline sweep →
micro (azure) → title masked rise → body → **its own video** (full-width,
`height: 56svh`, cover, native portrait) revealed by **corner mask-wipe**
(`mask-size 0%→101%`, 1250 ms ease-in-out, direction alternating
left-bottom / right-bottom / left-bottom). Digit watermark behind the title
(`7rem`, stroke-only, right-bleed). Each video IO play/pause — at most 1
runs (manager).

**Markup strategy (the reduced-motion/no-JS truth):** the DOM ships BOTH the
stacked per-step media slots and the desktop sticky panel; CSS gates them
(`≤991` and `prefers-reduced-motion` show stacked slots; desktop
no-preference shows the sticky panel). Hidden videos have `preload="none"`
and IO never fires on `display:none` → zero network cost for the unused
variant. Static markup = final state; all hiding/choreography lives inside
`gsap.matchMedia` branches only.

**Reduced motion:** stacked layout at every width, posters shown, no rail,
no wipes — everything readable top to bottom.

### 2.4 `Preuve` — « 03 — LA PREUVE » (~100 vh, the quiet one)

**Copy (verbatim from v2 — keep; figures render INSTANTLY, count-up is dead):**
- Label (h2): `03 — LA PREUVE`
- Stats: `100 %` / `Gratuit, sans exception` · `+250` / `Voitures trouvées` ·
  `4,9/5` / `Note de nos clients`
- Quote (`HOME_PULL_QUOTE` from `components/avis/testimonials` — file KEPT):
  `« Un vrai humain au téléphone, qui pose les bonnes questions. Pas de
  jargon, pas de pression. »`
- Meta link → `/avis`: `Karim B. — Extrait de nos avis · Voir tous les avis →`

**Desktop (≥992):**
- `min-height: min(100dvh, 64rem)`. Two columns: LEFT = **R panel**
  (`aspect-ratio: 9/16`, `height: 64vh`, hairline frame) revealed by
  **corner mask-wipe** from `left bottom` (mask-size `0%→101%`, 1250 ms
  ease-in-out, IO at 50 % visibility, once) — the French plate footage as
  the proof image. RIGHT = stats stack: three rows, each preceded by a
  hairline that sweeps `scaleX 0→1` (0.5 s `power1.inOut`, origins
  alternating left/right, stagger 0.15); figures (Octane,
  `clamp(2.8rem, 6vw, 5.5rem)`, wdth 100) masked-rise 0.6 s `power2.out` —
  final values in the markup, no JS counting. Below: the quote, masked
  per-line rise (duration 1, stagger 0.18, `power2.out` — the stately
  paragraph cadence), then the meta link in a small glass chip
  (`--glass` + blur 30px + radius 1em).
- **Living-glass hover** (desktop only): hovering the meta chip fades in
  (`opacity .3s outQuadCss`) a hidden **C3 bokeh video** layer,
  `filter: blur(2.5rem)`, behind the glass + chip radius morphs 1em→1.5em
  (.3 s). C3 loads on first `mouseenter` (`preload="none"` until then),
  pauses on leave. Underline sweep on the link label (existing NavLink
  grammar).

**Mobile (≤767):** stacked: label → R panel (full-width, `height: 48svh`,
cover, mask-wipe) → stats rows (full-width, hairlines) → quote → meta chip
(static glass, no hover layer — no hover-gated content; chip is a plain
tappable link).

**Reduced motion:** all visible, R shows poster, no sweeps/rises (instant),
no hover video.

### 2.5 `FinalCta` — « 04 — À VOUS » (~100 svh, the headlights payoff)

The frame the WebGL blob was faking, now real: the **I loop** — a car facing
you, headlights on.

**Copy (verbatim from v2 — keep):**
- Label: `04 — À VOUS`
- H2: `Allez-y.` (rendered uppercase by CSS: `ALLEZ-Y.`)
- Button → `/trouver-ma-voiture`: `Trouver ma voiture — Gratuit`
- Sub: `3 minutes pour décrire votre besoin. Un expert vous rappelle sous 24 h.`

**Desktop (≥992):** layered stage, `height: 100svh`:
- z0 — **blurred halo**: second `<video>` of I (same sources → one network
  fetch, cached), full-bleed cover, `filter: blur(2.5rem) brightness(.6)`,
  `transform: scale(1.2)` (blur edge bleed). Blur erases the upscale: the
  whole viewport glows with moving headlight light.
- z0.5 — tiled noise overlay (`noise.webp`-style asset via `asset()`,
  `opacity:.12`) to de-band the blur.
- z1 — **sharp I panel**: portrait, `height: 100svh`, centered,
  `object-fit: cover`, `brightness(.85)` — a full-height film strip, crisp
  at ~1.25× native.
- z2 — bottom gradient to `--background` (clean seam into Footer).
- z3 — content, centered: label top-left; `ALLEZ-Y.` Octane
  `clamp(4rem, 13vw, 12rem)`, masked rise on entry (0.8 s power2.out at 50 %
  visibility, once) **then** wdth 0→100 via CSS transition
  `font-variation-settings 3s outQuartCss` (class toggle — identical
  mechanism to the hero, closing the loop); glass pill button (`--glass`,
  blur 30 px, radius 1em) with the **C3 living-glass hover** + radius morph
  1em→1.5em + underline sweep; sub line below (Oak, `--paragraphs`).
- Triggered only — no pin, no scrub. The manager allows 2 playing videos
  here (sharp + halo); they are the only ones on screen.

**Mobile (≤767):** no halo layer (`display:none`, never fetched/decoded) —
the sharp I loop IS full-bleed native cover. Same content stack, button
full-width (`width: min(100%, 22rem)`), `ALLEZ-Y.` `clamp(3.4rem, 17vw,
5.8rem)`. Tap target ≥ 48 px.

**Reduced motion:** `I-poster.jpg` (headlights visible in the poster — still
a strong frame), `ALLEZ-Y.` resting at wdth 100, button static. Everything
legible, nothing hidden.

---

## 3. Infrastructure decisions

### 3.1 Lenis — landing-page scope (decided)

- `npm i lenis` (~9 kB gz). New client component
  `components/home/v3/SmoothScroll.tsx`, **mounted ONLY in `app/page.tsx`**
  (renders `null`). `/trouver-ma-voiture`, `/avis` and every other route
  never see Lenis → the multi-step form is provably unaffected (nothing to
  verify beyond "not mounted").
- Setup (the clean bridge, NOT Longbow's self-rAF):
  ```ts
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return; // native scroll
  const lenis = new Lenis({ duration: 1.6, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  const raf = (t: number) => lenis.raf(t * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  // cleanup: gsap.ticker.remove(raf); lenis.destroy();
  ```
- `duration: 1.6` (Longbow's 2 is floatier than our page needs; 1.6 still
  reads "expensive").
- **Anchor links**: delegated click handler on same-page hash links
  (`a[href^="#"]`) → `e.preventDefault(); lenis.scrollTo(hash)`; covers
  `#methode` from the Manifeste NavLink. Footer/nav links to other routes
  are plain navigations — untouched.
- No scrollable overlays on the landing; if one ever appears, mark it
  `data-lenis-prevent`.

### 3.2 three.js — REMOVED (decided, no exception)

No scene in v3 gives WebGL a job a `<video>` doesn't do better — the
"headlights" the shaders faked exist as real footage (I loop). Remove
`three` + `@types/three` from `package.json`, delete `components/home/three/`
entirely. The ~150 kB+ gz saved funds Lenis (~9 kB) with a large net
reduction; `/` first-load JS must land **below** its current size (≤170 kB
hard ceiling, expect ~−140 kB net).

### 3.3 Preloader — NO (decided)

Static export + instant hero = nothing honest to wait for. A 3 s lock is
hostile; even 1 s is debt. The hero's existing load fades are the page
entrance. (The line-sweep grammar lives on in section seams instead.)

### 3.4 Video playback manager (shared)

`components/home/v3/useVideoStage.ts` + `VideoStage.tsx` — every loop on the
page goes through it:

- Markup: `<video muted loop playsinline preload="none"
  poster={asset("/videos/X-poster.jpg")}>` + `<source webm>` + `<source mp4>`
  via `asset()` (basePath!). The Manifeste V stage alone may use
  `preload="metadata"` (first scene, near-certain view).
- IntersectionObserver (threshold .25): entering → `load()` (first time)
  then `play()`; leaving → `pause()`. **Global cap `MAX_PLAYING = 2`**
  (module-level Set; lowest-visibility video pauses when a third asks) —
  normal scroll has 1 playing, FinalCta peaks at 2 (sharp + halo).
- `requestVideoFrameCallback` watchdog: frame delta > 50 ms → `playbackRate
  = .5` (weak-GPU degradation).
- `prefers-reduced-motion` or `navigator.connection?.saveData`: never
  autoplay; poster shown; **tap toggles play/pause** (the "play only on tap"
  allowance).
- Boomerang note: the loops are single-direction ~3.5 s clips. Optional
  asset task (nice-to-have, not blocking): pre-render palindrome versions
  via ffmpeg (`[0:v]reverse` concat) as `*-boom.mp4/webm` so loop points
  vanish; `VideoStage` takes whatever base name it's given.

### 3.5 Marquee — shared component (decided)

`components/home/v3/Marquee.tsx`: props `{ items | text, speed (s per copy),
direction, paused }`. CSS-keyframe translateX, JS clone math + duration =
`copies × speed`, ResizeObserver, `animation-play-state` gating,
reduced-motion → `animation: none` + static fallback slot. Used twice in
`MarqueeBand` (6 s giant / 10 s strip); available for future use.

### 3.6 Engineering discipline (carried over from v2 — keep verbatim)

- Static markup IS the final / no-JS / reduced-motion state; choreography
  exists only inside `gsap.matchMedia` branches:
  `(min-width: 992px) and (prefers-reduced-motion: no-preference)`,
  `(max-width: 991px) and (prefers-reduced-motion: no-preference)`; the
  reduce branch adds nothing.
- `useGSAP({ scope })` everywhere; no `ScrollTrigger.killAll`.
- Phantom-rotation guard: every transform reveal is `fromTo` with explicit
  `rotation: 0` on BOTH ends; never `to()` from a CSS-set 3D transform.
- `document.fonts.ready.then(() => ScrollTrigger.refresh())` once (Octane is
  a variable font; metrics shift).
- Pinning = CSS `position: sticky` only (Manifeste, Methode). No
  ScrollTrigger `pin`, ever.
- Scrubbed properties: `transform` / `opacity` / `clip-path` / CSS vars
  (`--wdth`) only — no layout properties, 60 fps.
- ScrollTrigger registered once in `components/home/v3/scroll.ts`
  (`gsap.registerPlugin(ScrollTrigger)`), imported by scenes — replaces the
  deleted `components/home/scroll.ts`.

---

## 4. Typography scale (Octane display / Oak body)

| Token | Use | Size | Notes |
|---|---|---|---|
| `display-xl` | tricolon, `ALLEZ-Y.` | `clamp(3.4rem, 10vw, 9.5rem)` (CTA: `clamp(4rem, 13vw, 12rem)`) | Octane, uppercase, `line-height:.9`, wdth animated 0→100 |
| `display-marquee` | MarqueeBand giant | `clamp(6rem, 12vw, 12rem)` | wdth 100, `line-height:.85` |
| `display-digit` | Methode watermark | `clamp(12rem, 20vw, 20rem)` (mobile 7rem) | stroke 1px `#fff3`, fill transparent |
| `display-l` | step titles | `clamp(2rem, 4vw, 3.5rem)` | Octane, wdth 100 |
| `figure` | Preuve stats | `clamp(2.8rem, 6vw, 5.5rem)` | Octane, wdth 100, no-wrap |
| `quote` | Preuve quote | `clamp(1.25rem, 2.2vw, 1.75rem)` | Oak, `--heading`, `line-height:1.45` |
| `body` | paragraphs | `1rem / 1.6` | Oak, `--paragraphs`, `max-width: 34em` |
| `label` | chapters, micros, marquee strip | `.75rem`, `letter-spacing:.12em`, uppercase | existing `.label`; active micro = `--azure` |

## 5. Spacing rhythm

- Section heights: impact scenes `min(100dvh, 64rem)` sticky stages inside
  taller scroll wrappers (160 vh / 280 vh); quiet scenes `min(100dvh, 64rem)`;
  MarqueeBand `padding-block: clamp(3.5rem, 9vh, 6.5rem)`.
- Global content inset: `clamp(1.25rem, 4vw, 4rem)` — chapter labels always
  at this exact inset (the editorial spine).
- Breakpoints: 991 (layout split), 767 (stack + marquee swap), 479 (type
  floor + full-width button).
- Mobile sections densify to content height (`min-height: auto`, padding
  `clamp(4rem, 12svh, 6rem) inset`) — scale stays, choreography goes.

## 6. Easing table

| Name | Value | Use |
|---|---|---|
| `wfEase` | `cubic-bezier(.25,.1,.25,1)` (registered) | load fades, label fades |
| `outQuad` | `power1.out` | UI micro-moves |
| `power2.out` | — | ALL text entrances (masked rises) |
| `power2.in` | — | text exits (Methode swaps) |
| `power1.inOut` | — | line sweeps (0.5 s) |
| `power2.inOut` | — | clip-path video wipes (0.7 s) |
| `none` (linear) | — | every scrub (swell, --wdth, rail), marquees |
| `outQuadCss` | `cubic-bezier(.25,.46,.45,.94)` | CSS transitions .3s default (hover glass, radius morph) |
| `outQuartCss` | `cubic-bezier(.165,.84,.44,1)` | the 3 s wdth stretch (CSS, interruptible) |
| `ease-in-out` (CSS) | — | 1250 ms corner mask-wipes |
| `back.out(1.5)` | — | forbidden except micro-accents ≤0.4 s (currently unused) |

## 7. File plan

**NEW — `components/home/v3/`** (all client components, CSS Modules):

```
SmoothScroll.tsx                  Lenis provider (landing-only, renders null)
scroll.ts                         registers ScrollTrigger (v3 namespace)
useVideoStage.ts                  IO play/pause manager, MAX_PLAYING=2, watchdog
VideoStage.tsx / .module.css      poster+sources via asset(), variants: panel|cover|halo
Marquee.tsx / .module.css         shared clone-math marquee
Manifeste.tsx / .module.css       01 — swell + tricolon wdth scrub
MarqueeBand.tsx / .module.css     breath strip
Methode.tsx / .module.css         02 — sticky step machine (id="methode")
Preuve.tsx / .module.css          03 — stats + R panel + quote
FinalCta.tsx / .module.css        04 — headlights payoff
```

**EDIT:** `app/page.tsx` (new imports per §1). `package.json` (deps).

**DELETE (v2):**
```
components/home/HomeStory.tsx + .module.css
components/home/Manifesto.tsx  + .module.css
components/home/Method.tsx     + .module.css
components/home/Proof.tsx      + .module.css
components/home/FinalCta.tsx   + .module.css
components/home/scroll.ts
components/home/three/          (Beam.tsx, Scene.tsx, ThreeStage.tsx — all)
package.json: "three", "@types/three"   → npm uninstall three @types/three
```

**KEEP / REUSE:** `Hero` (untouched), `Footer`/`Navbar` (untouched),
`NavLink` (Manifeste link + underline grammar), `components/avis/
testimonials.ts` (`HOME_PULL_QUOTE`), `lib/gsap.ts`, `lib/asset.ts`, all of
`public/videos/*`.

**Acceptance gates:** `next build` (static export) green; `/` first-load JS
≤ 170 kB (expect well under after three removal); Lighthouse: no CLS from
reveals (masks reserve space); every video request absent until its IO
fires; reduced-motion pass shows 100 % of copy with posters; 479/767/991
each get the intentional layout above, not a shrink.
