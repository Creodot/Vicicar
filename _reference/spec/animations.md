# Vicicar — Definitive Animation Spec (GSAP rebuild)

Source of truth: `_reference/ix2.json` (Webflow IX2 data, decoded below), `_reference/home.html`
(inline initial styles), `_reference/hero-styles.txt` / `webflow.css` (CSS transitions),
`_reference/webflow.js` (easing function definitions).

Home page IX2 page id: `66633f49f8dd31594c5298f8`. All home-page events run on **all 4 breakpoints**
(`main ≥992`, `medium 768–991`, `small 480–767`, `tiny <480`) — no media-query restrictions.

---

## 0. Easing dictionary (verified against webflow.js source)

| IX2 / CSS name | Exact definition | GSAP equivalent |
|---|---|---|
| `outQuad` (IX2) | `f(t) = 1 − (1−t)²` (webflow.js: `-(Math.pow(pos-1,2)-1)`) | `"power1.out"` — **exact match** |
| `ease` (IX2) | `cubic-bezier(0.25, 0.1, 0.25, 1)` (webflow.js line 6003; the CSS default `ease`) | `CustomEase.create("wfEase", "0.25, 0.1, 0.25, 1")` |
| Letter stretch (CSS) | `cubic-bezier(0.165, 0.84, 0.44, 1)` (canonical easeOutQuart) | stays pure CSS; if ever needed in JS: `"power3.out"` |
| Menu-button bg (CSS) | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` (easeOutQuad) | stays pure CSS |

Register once: `gsap.registerPlugin(useGSAP, CustomEase)` then
`CustomEase.create("wfEase", "0.25, 0.1, 0.25, 1")`.

All IX2 durations below are given in **ms** (IX2 native) — divide by 1000 for GSAP.

---

## 1. Page-load hero sequence (PAGE_START, home page)

Six IX2 actionLists fire simultaneously at "page start" (Webflow fires these on IX2 init,
≈ DOMContentLoaded). Decoded:

### 1a. Letters — `a-15` … `a-20` ("Letter N - View 0.20s" … "0.45s")

Initial state (group 0, `useFirstGroupAsInitialState: true` — also baked into inline styles in
home.html to prevent FOUC):

```
.letter:  opacity: 0
          transform: translate3d(3vw, 0, 0) rotateX(7deg) rotateY(70deg)
          transform-style: preserve-3d        (parent .block-letter has perspective: 1000px)
```

Animation (per letter, all three properties tween together, in parallel):

| actionList | target | delay (ms) | duration (ms) | ease | to |
|---|---|---|---|---|---|
| a-15 | `.letter.preload-1` (V) | **200** | 1000 | outQuad | opacity 1, x 0vw, rotateX 0, rotateY 0 |
| a-16 | `.letter.preload-2` (I) | **250** | 1000 | outQuad | same |
| a-17 | `.letter.preload-3` (C) | **300** | 1000 | outQuad | same |
| a-18 | `.letter.preload-4` (I) | **350** | 1000 | outQuad | same |
| a-19 | `.letter.preload-5` (C) | **400** | 1000 | outQuad | same |
| a-20 | `.letter.preload-6` (A **and** R) | **450** | 1000 | outQuad | same |

**Critical quirk:** there is no `preload-7`. Both the 6th letter (A) and the 7th letter (R) carry
class `preload-6`, so **A and R flip in simultaneously** at the 450 ms mark. The stagger is
50 ms per letter, but the last two are a pair. Replicate exactly:
`delays = [0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.45]`.

Last letter settles at **1450 ms**.

### 1b. Navbar + tagline — `a-13` ("Preload Navbar")

Initial state: `.navbar` opacity 0, `.block-info` opacity 0 (block-info has inline `opacity:0` in
home.html; navbar gets it from IX2 initial-state group at init — in the rebuild set both in CSS).

| target | delay (ms) | duration (ms) | ease | to |
|---|---|---|---|---|
| `.navbar` | **700** | **1400** | `ease` → wfEase | opacity 1 |
| `.block-info` (tagline "Laissez-Nous Trouver Votre Voiture Idéale") | **700** | **1400** | `ease` → wfEase | opacity 1 |

Both fade together, starting while letters are still flipping (700 ms), finishing at **2100 ms** —
the slow fade overlaps and outlasts the letter flips. Opacity only, no transform.

### 1c. Master load timeline (absolute times)

```
t=0.00s  page start; letters hidden (CSS), navbar+tagline opacity 0 (CSS)
t=0.20s  V starts      ─┐
t=0.25s  I starts       │ each: 1.0s, power1.out
t=0.30s  C starts       │ opacity 0→1, x 3vw→0, rotX 7°→0, rotY 70°→0
t=0.35s  I starts       │
t=0.40s  C starts       │
t=0.45s  A + R start   ─┘
t=0.70s  navbar + tagline fade starts (1.4s, wfEase, opacity only)
t=1.45s  last letters settled
t=2.10s  navbar + tagline at full opacity — sequence complete
```

Stale data note: ix2.json also has two `SCROLL_INTO_VIEW → a-20` events on the home page
(e-45/e-47) referencing element ids that no longer exist in home.html. Ignore them.

---

## 2. Letter hover — video reveal + variable-font stretch

Two independent mechanisms run concurrently. Hover target is the **`.letter` glyph div itself**
(IX2 events e-79…e-90, e-560/e-561 bind MOUSE_OVER/MOUSE_OUT to each letter element, not the
`.block-letter` wrapper). The glyph is `display:inline-block`, `font-size:34vw`,
`padding: 2vw 0 7.5vw` — that padded box is the hover hit area.

### 2a. IX2 part — background video fade (`a-11` / `a-12`)

Target: the `.bg-video-letter` **sibling** of the hovered letter (`useEventTarget: SIBLINGS`,
i.e. the video inside the same `.block-letter`). Stacking: video `z-index:5`, absolute `inset:0`,
`height:100%`; glyph `z-index:10` stays on top of it.

`a-11` "Background Video - On" (MOUSE_OVER):
1. Initial state: opacity 0, `display: none` (matches inline styles in home.html).
2. Group 1 (instant, dur 0): `display: block`.
3. Group 2: opacity **0 → 1, 500 ms, outQuad** (`power1.out`).

`a-12` "Background Video - Out" (MOUSE_OUT):
1. opacity **→ 0, 500 ms, outQuad**.
2. Then (instant): `display: none`.

In/out interrupt each other (IX2 `autoStopEventId` pairs them): hovering out mid-fade tweens from
the current opacity. Use `gsap.to` + autoAlpha (kills + overwrites) rather than fromTo.

Videos: muted, looping, `object-fit: cover`, poster as background-image. Webflow autoplays them
permanently; in the rebuild, `video.play()` on hover-in and `video.pause()` after the fade-out
completes (perf win, identical visual).

**Asset mapping quirk (keep for 1:1 fidelity):** the video files are not letter-matched in order —
home.html pairs them as: V→`V.mp4`, I(2)→`C.mp4`, C(3)→`I.mp4`, I(4)→`C3.mp4`, C(5)→`I2.mp4`,
A→`A2.mp4`, R→`R.mp4` (local files in `_reference/assets/`, each with .webm + poster jpg).

### 2b. Pure CSS part — variable-font width stretch (NOT IX2)

This is a plain CSS transition in webflow.css, **not** an IX2 interaction. Keep it pure CSS:

```css
.letter {
  font-family: Octane;                       /* OctaneGX.ttf, axes wght 0–100, wdth 0–100 */
  font-variation-settings: "wght" 10, "wdth" 0;
  transition: font-variation-settings 3s cubic-bezier(0.165, 0.84, 0.44, 1);
}
.letter:hover {
  font-variation-settings: "wght" 10, "wdth" 100;
}
```

- 3 s duration, easeOutQuart bezier, symmetric (same 3 s curve plays back on mouse-out).
- Only `wdth` animates (0 → 100); `wght` stays 10.
- The glyph physically widens; since `.block-letter` is `flex:1` the neighbours reflow — that
  squeeze is part of the effect. Do not move this to GSAP; CSS handles interrupts/reverse natively
  and stays off the main thread.

Net hover feel: video fades in fast (0.5 s) while the letter slowly stretches for 3 s on top of it.

---

## 3. Navbar link underline sweep (`a-3` / `a-4`)

Events e/e-2, e-7…e-12: MOUSE_OVER/MOUSE_OUT on each `.nav-link`
(AVIS, A PROPOS, TROUVER MA VOITURE, CONTACT). Target: the `.underline` **child** of the hovered
link (`useEventTarget: CHILDREN`). Structure: `.block-underline` (width 100%, height 1px,
`overflow: hidden`) > `.underline` (absolute inset 0, background white).

Initial state (CSS + IX2 group 0): `transform: translateX(-105%)` — parked off-screen left.

`a-3` "Underline - On" (hover-in):
- translateX **−105% → 0%**, **300 ms**, `outQuad` (`power1.out`).

`a-4` "Underline - Out" (hover-out):
- translateX **current → +105%**, **300 ms**, `outQuad` — exits to the RIGHT (the awwwards sweep:
  enters left, leaves right).
- Then (instant, dur 0): reset translateX to **−105%** so the next hover re-enters from the left.

In/out auto-stop each other; a quick re-hover during the exit tweens from wherever it is back to 0
(do NOT hard-reset on hover-in).

Percentages are relative to the underline's own width → use GSAP `xPercent`.

---

## 4. Everything else in ix2.json (for secondary pages designed in the same aesthetic)

These don't run on the live home page but are part of the same design system — reuse them when
designing the form/about/work pages.

### 4a. "Extra" hero variant (PAGE_START on page `…98fa`, `a-21`–`a-27`)
A second homepage treatment where, after the letters land, the **bg videos themselves flip in
and stay visible**:
- `a-21`–`a-26` "BG Video N - View": `.bg-video-letter.preload-N` from
  opacity 0, x **6vw**, rotateX **7°**, rotateY **50°** → identity;
  duration **1000 ms**, `outQuad`; delays **1500 / 1550 / 1600 / 1650 / 1700 / 1750 ms**
  (same 50 ms stagger, starting 1.5 s in — i.e. right after the letter flips finish).
- `a-27` "Preload Wrapper Letter Extra": `.wrapper-letter.extra` width **60% → 100%**,
  duration **1700 ms**, delay **1500 ms**, ease `wfEase` — the whole word breathes wider while
  the videos appear.

### 4b. Cursor-follow arrow on cards (work page `…904`, `a-29`/`a-30`/`a-31`)
Per card: MOUSE_MOVE continuous + MOUSE_OVER/OUT.
- `a-29` "Arrow Move" (MOUSE_X / MOUSE_Y, `basedOn: ELEMENT`, **smoothing 95**, resting 50 =
  center): `.block-arrow` child maps mouse 0→100% to translate **−50% → +50%** on both axes;
  inner `.arrow` maps to **−35% → +35%** (parallax depth, arrow lags inside its halo).
- `a-30` "Arrow - On": opacity 0 → 1, **300 ms**, outQuad. `a-31` "Arrow - Out": → 0, 300 ms, outQuad.
- GSAP: `gsap.quickTo(el, "xPercent"/"yPercent", { duration: 0.6, ease: "power3" })` driven by
  pointermove (IX2 smoothing 95 ≈ very heavy lerp ≈ 0.5–0.7 s catch-up).

### 4c. Generic scroll-in preload (`a-34` "Preload", SCROLL_INTO_VIEW, 39 events across pages)
Element fades opacity 0 → 1, duration **1400 ms**, delay **200 ms**, ease `wfEase`,
trigger offset **0%** (fires as soon as element enters viewport), plays once.
This is the house style for revealing any section/heading on secondary pages →
`ScrollTrigger` + `gsap.to(el, { autoAlpha: 1, duration: 1.4, delay: 0.2, ease: "wfEase",
scrollTrigger: { trigger: el, start: "top bottom" } })`.

### 4d. Mobile nav menu (Webflow native w-nav, not IX2)
`data-animation="default"` (dropdown slides down while menu height animates),
`data-duration="400"` ms, easing `ease` both directions, `data-collapse="small"`
(hamburger at ≤767 px). `.menu-button`: round glass chip, CSS transition
`background-color .3s cubic-bezier(.25,.46,.45,.94)`, open state `#70707066` (vs `#70707033`).
Rebuild: animate menu container height 0→auto + fade, **0.4 s, wfEase**; keep button bg as CSS.

---

## 5. GSAP implementation plan (Next.js + @gsap/react)

### What is GSAP vs CSS

| Animation | Engine |
|---|---|
| Hero load (letters + navbar/tagline) | GSAP timeline in `useGSAP` on mount |
| Letter hover video fade | GSAP (contextSafe event handlers) |
| Letter `wdth` 0→100 stretch | **pure CSS** (`:hover` + transition) |
| Nav underline sweep | GSAP (contextSafe handlers) — interrupt behavior needs `gsap.to` from current state |
| Menu-button bg, any simple hover tints | pure CSS |
| Scroll-in reveals (secondary pages) | GSAP + ScrollTrigger |
| Cursor arrow (work page) | GSAP `quickTo` |

### FOUC-proof initial state (SSR)
Set initial states in CSS (mirrors Webflow's inline styles), then animate **to** identity:

```css
.letter      { opacity: 0;
               transform: translate3d(3vw,0,0) rotateX(7deg) rotateY(70deg);
               transform-style: preserve-3d; }
.block-letter{ perspective: 1000px; }
.navbar, .block-info { opacity: 0; }
.bg-video-letter { opacity: 0; visibility: hidden; }   /* autoAlpha-compatible stand-in for display:none */
.underline   { transform: translateX(-105%); }
```

### Hero load timeline

```ts
useGSAP(() => {
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const tl = gsap.timeline();
    tl.to(".letter", {
      opacity: 1, x: 0, rotationX: 0, rotationY: 0,
      duration: 1, ease: "power1.out",
      stagger: (i) => Math.min(i, 5) * 0.05,   // 0,.05,.10,.15,.20,.25,.25 — A & R together
    }, 0.2)
      .to([".navbar", ".block-info"], {
        autoAlpha: 1, duration: 1.4, ease: "wfEase",
      }, 0.7);
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set(".letter, .navbar, .block-info",
      { opacity: 1, x: 0, rotationX: 0, rotationY: 0, visibility: "visible" });
  });
}, { scope: heroRef });
```

Transform-order caveat: Webflow composes `translate3d → rotateX → rotateY`; GSAP composes
rotationY before rotationX. At rotX 7° / rotY 70° the visual difference is negligible (<1° skew of
the flip axis) — accept GSAP's order. Do not split into nested wrappers unless a side-by-side
comparison shows drift.

### Letter hover (per `.block-letter`)

```ts
const { contextSafe } = useGSAP({ scope: blockRef });
const onEnter = contextSafe(() => {
  video.play().catch(() => {});
  gsap.to(videoWrap, { autoAlpha: 1, duration: 0.5, ease: "power1.out", overwrite: "auto" });
});
const onLeave = contextSafe(() => {
  gsap.to(videoWrap, { autoAlpha: 0, duration: 0.5, ease: "power1.out", overwrite: "auto",
                       onComplete: () => video.pause() });
});
// bind onMouseEnter/onMouseLeave on the .letter glyph div (NOT the block wrapper)
```

`autoAlpha` reproduces IX2's `display:none → block → fade` (visibility flips at opacity 0).
The `wdth` stretch needs zero JS — it lives entirely in the CSS above (section 2b).

### Nav underline (per `.nav-link`)

```ts
const onEnter = contextSafe(() =>
  gsap.to(underline, { xPercent: 0,    duration: 0.3, ease: "power1.out", overwrite: "auto" }));
const onLeave = contextSafe(() =>
  gsap.to(underline, { xPercent: 105,  duration: 0.3, ease: "power1.out", overwrite: "auto",
                       onComplete: () => gsap.set(underline, { xPercent: -105 }) }));
```

(Initial CSS `translateX(-105%)`; with GSAP use `gsap.set(underline, { xPercent: -105 })` once on
mount instead, so GSAP owns the transform and `xPercent` tweens read correct starting values.)

### Numbers cheat-sheet (GSAP units)

| Tween | duration | delay/position | ease | from → to |
|---|---|---|---|---|
| Letter flip-in (each) | 1.0 | 0.20 + 0.05·min(i,5) | power1.out | opacity 0→1, x 3vw→0, rotX 7→0, rotY 70→0 |
| Navbar/tagline fade | 1.4 | 0.7 | wfEase (.25,.1,.25,1) | opacity 0→1 |
| Video reveal (hover-in) | 0.5 | 0 | power1.out | autoAlpha 0→1 (+ play) |
| Video hide (hover-out) | 0.5 | 0 | power1.out | autoAlpha →0 (+ pause on complete) |
| Letter wdth stretch (CSS) | 3.0 | 0 | cubic-bezier(.165,.84,.44,1) | "wdth" 0→100 (hover), reverses on out |
| Underline in | 0.3 | 0 | power1.out | xPercent −105→0 |
| Underline out | 0.3 | 0 | power1.out | xPercent →105, then set −105 |
| Scroll-in reveal (a-34) | 1.4 | 0.2 | wfEase | autoAlpha 0→1, start "top bottom", once |
| Mobile menu open/close | 0.4 | 0 | wfEase | height/clip + fade |
| Extra-hero bg videos (variant) | 1.0 | 1.5 + 0.05·i | power1.out | opacity 0→1, x 6vw→0, rotX 7→0, rotY 50→0 |
| Extra-hero wrapper width (variant) | 1.7 | 1.5 | wfEase | width 60%→100% |
