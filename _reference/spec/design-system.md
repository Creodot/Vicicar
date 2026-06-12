# VICICAR — Design System & Layout Spec (v1, definitive)

Source of truth: `_reference/webflow.css` (verified byte-identical to the live published
stylesheet `vicicar.webflow.08b3629b0.css`, 71 841 bytes), `_reference/home.html`
(published 2024-08-26), `_reference/ix2.json` (Webflow interactions), `_reference/hero-styles.txt`.

Everything in this document is extracted from those files. Anything that is an
interpretation, recommendation, or deviation from source is explicitly flagged with
**[NOTE]** or **[RECO]**.

---

## 1. Design tokens

### 1.1 CSS custom properties (the complete `:root` — there are only 6)

```css
:root {
  --background: black;        /* page + hero background          */
  --paragraphs: #ffffff80;    /* body text (white @ 50%)         */
  --heading: white;           /* headings, nav text, letters     */
  --border: #fff3;            /* hairlines, form underlines      */
  --midnight-blue: #272c5d;   /* brand accent (unused on home)   */
  --azure: #d9e9e9;           /* brand accent (splash links)     */
}
```

### 1.2 Literal colors used throughout (not tokenized in source — tokenize them in our build)

| Suggested token            | Value        | Used by |
|---------------------------|--------------|---------|
| `--glass`                 | `#70707033`  | mobile nav-menu pill, menu-button, block-arrow |
| `--glass-active`          | `#70707066`  | menu-button `.w--open` |
| `--button-bg`             | `#7d7d7d33`  | `.button`, `.submit-button` |
| `--button-bg-hover`       | `#7d7d7d66`  | button hover |
| `--scrim`                 | `#0000004d`  | `.bg-blur`, `.bg-gradient` (+ gradient `#0000 → #000`) |
| `--radial-glow`           | `#1d1d1d`    | `.sticky-contact` radial-gradient center |
| `--splash-bg`             | `#ffffff1a`  | `.link-splash` |
| `--splash-bg-hover`       | `#ffffff26`  | `.link-splash:hover` |
| `--azure-50`              | `#d9e9e980`  | `.link-splash` text |
| success                   | `#00aa2d` on `#00aa2d26` | form success |
| error                     | `red` on `#cf000026`     | form error |

### 1.3 Easing curves (catalog — reuse these exact curves everywhere)

| Name (Webflow)   | Value                                  | Used for |
|------------------|----------------------------------------|----------|
| `outQuart`       | `cubic-bezier(.165, .84, .44, 1)`      | letter `font-variation-settings` 3s hover |
| `outQuad`        | `cubic-bezier(.25, .46, .45, .94)`     | ALL UI transitions (.3s/.35s/.5s): buttons, underline, video fades, footer links |
| `ease` (CSS)     | `ease`                                 | page-load opacity fades (navbar, tagline) |

**[RECO]** globals: `--ease-out-quart: cubic-bezier(.165,.84,.44,1); --ease-out-quad: cubic-bezier(.25,.46,.45,.94);`
GSAP equivalents: `power2.out` ≈ outQuad, `power4.out`-ish ≈ outQuart (or `CustomEase.create(".165,.84,.44,1")` for exactness — prefer CustomEase for 1:1).

### 1.4 Radii / blur scale

- Glass pill radius: `1em` (mobile nav-menu)
- Round buttons: `border-radius: 100%` (menu-button, block-arrow) and `50em` (pill buttons)
- Blur scale: `blur(30px)` nav pill · `blur(20px)` menu-button / block-arrow · `blur(15px)` `.bg-blur` page scrim

---

## 2. Typography

### 2.1 Font files (already downloaded, ship locally)

| File | Family | Axes / weights | Role |
|------|--------|----------------|------|
| `fonts/OctaneGX.ttf`            | `Octane`   | variable: `wght` 0–100 **and** `wdth` 0–100 | display letters only |
| `fonts/OakSansVF.woff2`         | `Oak Sans` | variable `wght` 300–900, normal | everything else |
| `fonts/OakSans-ItalicVF.woff2`  | `Oak Sans` | variable `wght` 300–900, italic | `em`, blockquote |

Exact source `@font-face` (reproduce verbatim, only swap URLs to `/fonts/...`):

```css
@font-face {
  font-family: 'Oak Sans';
  src: url('/fonts/OakSans-ItalicVF.woff2') format('woff2');
  font-weight: 300 900; font-style: italic; font-display: swap;
}
@font-face {
  font-family: 'Oak Sans';
  src: url('/fonts/OakSansVF.woff2') format('woff2');
  font-weight: 300 900; font-style: normal; font-display: swap;
}
@font-face {
  font-family: 'Octane';
  src: url('/fonts/OctaneGX.ttf') format('truetype');
  font-weight: 0 100; font-style: normal; font-display: swap;
}
```

**[RECO] Use plain `@font-face` in `globals.css` + files in `/public/fonts` — NOT `next/font/local`.**
Reasons: (1) Octane's non-standard `font-weight: 0 100` range and dual custom axes are
exactly what `next/font`'s fallback-metric adjustment and hashed family names get in the
way of; (2) the design relies on literal family names (`Octane, sans-serif`,
`Oak Sans, sans-serif`) and direct `font-variation-settings`; (3) 1:1 fidelity with
`font-display: swap` matches source. Add in `app/layout.tsx`:
`<link rel="preload" href="/fonts/OctaneGX.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />`
(and the two woff2). Hero letters must never FOIT — Octane preload is critical.

### 2.2 Base element styles (globals)

```css
body {
  background-color: var(--background);
  color: var(--paragraphs);
  display: flex; flex-direction: column;
  justify-content: flex-start; align-items: stretch;
  font-family: 'Oak Sans', sans-serif;
  font-size: 16px;            /* 15px at ≤767px */
  font-weight: 400;
  line-height: 1.7em;
  margin: 0;
}
```
**[NOTE]** `body` is a flex column — sections use `flex: 1` to fill viewport
(`.section-hero` relies on this). Keep this in the Next.js layout (`html, body` chain).

Headings — all use `color: var(--heading)`, `font-variation-settings: "wght" 550`,
`font-weight: 600`, `margin: 0`:

| El | size (base) | lh | ≤991 | ≤767 | ≤479 |
|----|------|------|------|------|------|
| h1 | 3.5em  | 1.1em  | 3.1em | 2.6em | 2.2em |
| h2 | 2.87em | 1.15em | 2.5em | 2.1em | 1.8em |
| h3 | 2.37em | 1.16em | 2em   | 1.7em | 1.5em |
| h4 | 1.87em | 1.2em  | 1.5em | 1.4em | 1.3em |
| h5 | 1.37em | 1.23em | 1.3em | 1.2em | 1.1em |
| h6 | 1.12em | 1.28em | —     | 1em   | —    |

Other elements:
- `p` — `color: var(--paragraphs); font-size: 1.1em; line-height: 1.7em; margin: 0;`
- `a` — `text-decoration: underline;` (default; components override)
- `ul, ol` — `margin: 1.3em 0; padding-left: 2.2em; font-size: 1.1em; line-height: 1.7em;` · `li { padding: .2em .5em; }`
- `strong` — `color: var(--heading); font-weight: 600;`
- `em` — `font-style: italic;`
- `blockquote` — `border-left: 1px solid var(--border); color: var(--heading); margin: 1.3em 0 1.3em .9em; padding-left: 1.3em; font-size: 1.37em; font-style: italic; line-height: 1.7em;`
- `figure` — `margin: 2.7em 0;` · `figcaption` — centered, `margin-top .8em`, `padding 0 7%`, `1em/1.5em`

### 2.3 The recurring "label" type style (the site's signature micro-typography)

Used by nav links, tagline, footer links, subtitles, CTA text, form labels — memorize it:

```css
font-size: .8em;
font-weight: 500;
line-height: 1.2em;          /* 1.7em for .text-info / .text-cta */
letter-spacing: .07em;
text-transform: uppercase;
color: var(--heading);       /* often at opacity .5 or .35 for secondary */
```

### 2.4 Octane display recipes

| Class | size | line-height | variation | notes |
|---|---|---|---|---|
| `.letter` (hero)     | **34vw** | 100%  | `"wght" 10, "wdth" 0` → hover `"wdth" 100` | 3s outQuart transition |
| `.heading-page`      | 13em | .8em | same | `margin: -.12em 0 .02em` · ≤991: 22vw |
| `.heading-project`   | 13em (`.large` 22em) | .8em | same | ≤991: 20vw (`.large` 28vw, ≤767: 22vw) |
| `.letter-cta`        | 12em | .8em  | same + 3s hover | ≤991: 20vw |
| `.letter-contact`    | 14em | .85em | same + 3s hover | ≤991: 22vw |
| `.text-span-wide`    | —    | —     | `"wght" 10, "wdth" 100` static | `margin: 0 -.07em` — inline expanded span inside headings |
| `.octane-typeface`   | 5em  | 1em   | `"wght" 10, "wdth" 0` | style-guide sample |

All Octane usage: `font-family: Octane, sans-serif; font-weight: 100; text-transform: uppercase;`.

---

## 3. Navbar — complete spec

### 3.1 DOM structure (1:1 from home.html)

```
.navbar                       (fixed bar, role=banner)
├─ a.brand-mobile  → logo-mobile.svg   (.logo.mobile, h 1.4em)  [hidden ≥768]
├─ nav.nav-menu                                                  [hidden ≤767 until menu open]
│  └─ .grid-navbar (w-layout-grid)
│     ├─ .nav  (left group)
│     │  ├─ a.nav-link  → "AVIS"        { .nav-text + .block-underline > .underline }
│     │  └─ a.nav-link  → "A PROPOS"    { idem }
│     ├─ a.brand → logo.svg (.logo, h 1.62em)   [desktop centered logo; hidden ≤767]
│     └─ .nav  (right group)
│        ├─ a.nav-link.right → "TROUVER MA VOITURE"  { idem }
│        └─ a.nav-link.right → "CONTACT"             { idem }
└─ .menu-button  (round glass burger)            [shown only ≤767]
```

### 3.2 Rules

```css
.navbar {
  z-index: 500;
  position: fixed; inset: 0% 0% auto;        /* top:0 left:0 right:0 */
  display: flex; flex-direction: row;
  justify-content: space-between; align-items: center;
  background-color: #0000;                    /* TRANSPARENT — see note */
  padding: .7em .7em 0;                       /* top .7em, sides .7em */
}

.nav-menu { width: 100%; }                    /* desktop: plain full-width container */

.grid-navbar {                                /* extends .w-layout-grid (display:grid) */
  grid-template-columns: 1fr auto 1fr;        /* left links | logo | right links */
  grid-template-rows: auto;
  grid-column-gap: .5em; grid-row-gap: 0;
  place-items: center stretch;
}

.nav { display: flex; flex-direction: row; justify-content: center; align-items: center; }

.brand { display: flex; flex-direction: column; justify-content: center; align-items: center;
         padding: 1.1em 1.2em; position: relative; }
.logo  { z-index: 10; height: 1.62em; position: relative; }
.logo.mobile { height: 1.4em; }

.nav-link        { margin-right: auto; padding: .5em 1.2em; text-decoration: none; position: relative; }
.nav-link.right  { margin-left: auto; margin-right: 0; }
/* => inside each 1fr column the two left links pack left, the two right links pack right */

.nav-text {
  z-index: 10; position: relative;
  color: var(--heading);
  font-size: .8em; font-weight: 500; line-height: 1.2em;
  letter-spacing: .07em; text-transform: uppercase;
  margin: .5em 0;
}

/* underline reveal element (animated by interaction, §5.1) */
.block-underline { width: 100%; height: 1px; position: relative; overflow: hidden; }
.underline { position: absolute; inset: 0%; width: 100%;
             background-color: var(--heading); transform: translate(-105%); }

.brand-mobile { display: none; /* ≤767: flex */ flex-direction: column;
                justify-content: center; align-items: center;
                margin-right: auto; padding: .8em; position: relative; }
```

### 3.3 **[NOTE] Glass-pill clarification (important)**

In the published CSS the `blur(30px) / #70707033 / radius 1em` glass treatment on
`.nav-menu` exists **only inside the ≤767px media query** — it styles the **opened
mobile dropdown menu**. The desktop navbar is a fully **transparent** fixed bar
(`background: #0000`, no blur) with text links floating over the hero. Verified against
the live CDN stylesheet. The project brief's "glass navbar" refers to this mobile pill +
the round glass `.menu-button`. Build it exactly as source: transparent desktop bar,
glass pill only for the open mobile menu. (If the owner later wants a desktop glass pill,
it's a 5-line additive change — do not bake it in for 1:1.)

### 3.4 Mobile menu (≤767px) behavior — Webflow `data-collapse="small"`

- `.nav-menu` hidden; `.menu-button` displayed.
- `.menu-button`: `display:flex; justify-content:center; align-items:center; padding:.8em; font-size:1.3em; color:var(--heading); background:#70707033; backdrop-filter:blur(20px); border-radius:100%; transition: background-color .3s var(--ease-out-quad);` → open state `background:#70707066`.
- `.brand-mobile` becomes `display:flex` (mobile logo top-left, `margin-right:auto`).
- When opened (Webflow drops the menu in an overlay under the bar, animation `ease 400ms` per `data-duration="400"`), `.nav-menu` gets the glass pill:
  `backdrop-filter: blur(30px); background: #70707033; border-radius: 1em; width: auto; margin: .7em .7em 0; padding: .7em 0;`
- `.grid-navbar` collapses to `grid-template-columns: 1fr` and `.nav` to `flex-direction: column`.
- `.nav-link` gets `margin-left: auto` (→ both margins auto = **centered**) and `.nav-link.right` gets `margin-right: auto` (also centered). All four links stack centered; `.brand` (desktop logo) is `display: none`.

**[RECO]** In Next.js implement as a controlled `<MobileMenu>` (no Webflow runtime):
button toggles an absolutely-positioned glass panel under the bar; animate height/opacity
400ms ease with GSAP; lock to ≤767px via the same media query.

---

## 4. Hero — complete spec

### 4.1 DOM structure

```
section.section-hero
├─ .wrapper-letter
│  └─ ×7  .block-letter
│         ├─ .letter.preload-N        (the glyph; N = 1..6, see 4.4)
│         └─ .bg-video-letter         (absolute bg video wrapper, opacity:0, display:none)
│            └─ video[autoplay loop muted playsinline]  poster = bg-image, object-fit: cover
└─ .block-info
   └─ .text-info  "Laissez-Nous Trouver Votre Voiture Idéale"
```

### 4.2 Rules

```css
.section-hero {
  z-index: 100;
  background-color: var(--background);
  display: flex; flex-direction: column; flex: 1;
  justify-content: center; align-items: center;
  min-height: 100svh;
  position: relative; overflow: hidden;
}

.wrapper-letter { z-index: 50; display: flex; flex-direction: row;
                  justify-content: center; align-items: center; position: relative; }
/* (.wrapper-letter.extra { width: 100%; } exists but home uses the base, content-width) */

.block-letter {
  z-index: 50; flex: 1;                 /* 7 equal columns */
  perspective: 1000px;                  /* parent of the 3D letter intro */
  display: flex; flex-direction: column;
  justify-content: center; align-items: stretch;
  text-align: center; position: relative;
}

.letter {
  z-index: 10; position: relative; display: inline-block;
  color: var(--heading);
  font-family: Octane, sans-serif;
  font-size: 34vw;                      /* same at ALL breakpoints — no overrides */
  font-weight: 100; line-height: 100%;
  text-transform: uppercase; cursor: default;
  font-variation-settings: "wght" 10, "wdth" 0;
  padding-top: 2vw; padding-bottom: 7.5vw;   /* descender room; also = video hover hitbox */
  transition: font-variation-settings 3s cubic-bezier(.165, .84, .44, 1);
}
.letter:hover { font-variation-settings: "wght" 10, "wdth" 100; }

.bg-video-letter { z-index: 5; opacity: 0; height: 100%; position: absolute; inset: 0%; }
/* sits BEHIND its sibling .letter (z 10) inside .block-letter; initial display:none */

.block-info {
  z-index: 100; position: absolute; inset: auto 10% 1.8em;   /* bottom strip */
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  text-align: center;
}
.text-info {
  color: var(--heading); max-width: 32em;
  font-size: .8em; font-weight: 500; line-height: 1.7em;
  letter-spacing: .07em; text-transform: uppercase;
}
```

≤767px: `.block-info { bottom: 1em; }` · `.text-info { line-height: 1.6em; }`. That is the
**only** hero responsive change — letters stay `34vw` everywhere (7 × ~34vw glyphs at
`wdth 0` are ultra-condensed, so they fit).

### 4.3 Video element semantics (Webflow background-video → our implementation)

Each `.bg-video-letter` contains a `<video autoplay loop muted playsinline>` with
mp4 + webm sources and the poster set as a CSS `background-image` on the video element,
`object-fit: cover`, filling the block. **[RECO]** keep `preload="metadata"`, keep videos
mounted but `display:none`/`opacity:0` until hover (source behavior), and `pause()` when
hidden / `play()` on reveal to save battery (additive, invisible improvement).

### 4.4 Letter → asset mapping (exact, from home.html — note the shuffle)

| # | Glyph | preload class | video/poster asset (local `assets/`) |
|---|-------|---------------|---------------------------------------|
| 1 | V | `.preload-1` | `V.mp4` / `V.webm` / `V-poster.jpg` |
| 2 | I | `.preload-2` | **`C.mp4`** / `C.webm` / `C-poster.jpg` |
| 3 | C | `.preload-3` | **`I.mp4`** / `I.webm` / `I-poster.jpg` |
| 4 | I | `.preload-4` | `C3.mp4` / `C3.webm` / `C3-poster.jpg` |
| 5 | C | `.preload-5` | `I2.mp4` / `I2.webm` / `I2-poster.jpg` |
| 6 | A | `.preload-6` | `A2.mp4` / `A2.webm` / `A2-poster.jpg` |
| 7 | R | `.preload-6` (sic — shared) | `R.mp4` / `R.webm` / `R-poster.jpg` |

The CDN filenames are shuffled relative to the glyphs (asset "C" plays under letter "I",
etc.). Reproduce this mapping verbatim — the videos were graded per position.
Letter 7 (R) reuses `.preload-6`, so **A and R animate in simultaneously** (see §5.3).

---

## 5. Interactions (extracted from ix2.json — implement with GSAP)

### 5.1 Nav-link underline (hover, applies at all breakpoints)

Trigger: `mouseenter` on `.nav-link`. Target: its child `.underline`.
- In: set `x: -105%` instantly (500ms group but value is the resting state), then `x: -105% → 0%`, **300ms, outQuad**.
- Out (`mouseleave`): `x: 0% → 105%` 300ms outQuad, then snap back to `-105%` (dur 0).
Classic wipe-through underline. `.block-underline` provides the 1px overflow-hidden mask.

### 5.2 Letter hover → background video crossfade

Trigger: hover on `.letter`. Target: sibling `.bg-video-letter`.
- In: `display: block` → fade opacity `0 → 1`, **500ms, outQuad** (simultaneously the CSS
  transition stretches the glyph `wdth 0 → 100` over **3s outQuart**).
- Out: opacity `1 → 0` 500ms outQuad → `display: none` (glyph relaxes back over 3s).

### 5.3 Page-load intro (PAGE_START, home page)

Initial states (set as inline styles in source HTML — set pre-hydration to avoid flash):
- every `.letter`: `opacity: 0; transform: translate3d(3vw,0,0) rotateX(7deg) rotateY(70deg); transform-style: preserve-3d;` (parent `.block-letter` has `perspective: 1000px`)
- `.block-info`: `opacity: 0` · `.navbar`: `opacity: 0`

Timeline (all tweens **1000ms outQuad** to `opacity:1, x:0, rotateX:0, rotateY:0`):

| Target | delay |
|---|---|
| `.letter.preload-1` (V) | 200ms |
| `.letter.preload-2` (I) | 250ms |
| `.letter.preload-3` (C) | 300ms |
| `.letter.preload-4` (I) | 350ms |
| `.letter.preload-5` (C) | 400ms |
| `.letter.preload-6` (A **and** R together) | 450ms |
| `.navbar` + `.block-info` fade 0→1 | delay 700ms, **1400ms, `ease`** |

**[RECO]** one GSAP timeline: letters `stagger: 0.05` from 0.2s (last two combined),
navbar/tagline at 0.7s. Honor `prefers-reduced-motion` by jumping to end state.

---

## 6. Responsive breakpoints — full delta table

Breakpoints (Webflow): **≤991px**, **≤767px**, **≤479px** (desktop-first overrides).

### ≤991px
- Headings shrink (table §2.2).
- `.section-top` 11em/8em padding (`.full` bottom 2.5em, `.center` 9em/6em).
- Octane page headings switch to vw: `.heading-project` 20vw (`.large` 28vw), `.heading-page` 22vw, `.letter-cta` 20vw, `.letter-contact` 22vw.
- `.description`, `.description-project` → `.85em`.
- Work grids tighten (`grid-work-3` → 2 cols), `.section-call-to-action` 11em padding.

### ≤767px  (the big one — nav collapse)
- `body { font-size: 15px; }` (all em-based spacing scales down ~6%).
- Headings shrink again (§2.2).
- **Navbar**: `.nav-menu` hidden → glass pill when opened (`blur(30px)`, `#70707033`, radius 1em, margin .7em, padding .7em 0); `.grid-navbar → 1fr`; `.nav → column`; nav links centered (both margins auto); `.brand` hidden; `.brand-mobile → flex`; `.menu-button → flex` (round glass, blur(20px), `#70707033` → open `#70707066`).
- **Hero**: `.block-info { bottom: 1em }`, `.text-info { line-height: 1.6em }`. Letters unchanged (34vw).
- `.footer → flex-direction: column; grid-row-gap: .7em`.
- `.section-top` 9em/6em; work grids → 1 col, media heights → 50vw; `.heading-project.large` 22vw.

### ≤479px
- Headings final step (§2.2).
- `.block-field → column` (form fields stack, `grid-row-gap: 2em`).
- `.grid-content → 1fr`, `.grid-splash._3-columns → 1fr`, `.info-contact` margin-top 1.4em.
- Nothing further changes for navbar or hero.

---

## 7. Scrollbar / selection / focus

- **No custom scrollbar styles** in source. **No `::selection`** styles. Keep native for 1:1.
  **[RECO optional, flag to owner]:** `::selection { background: var(--azure); color: var(--background); }` would fit the brand — additive only.
- Custom focus states in source are limited to forms: `.text-field:focus, .textarea:focus { border-bottom-color: var(--heading); }` (Webflow resets `outline: 0` on inputs/nav-button — **[RECO]** restore `:focus-visible { outline: 1px solid var(--border); outline-offset: 4px; }` on nav links/buttons for a11y; invisible to mouse users).
- Placeholders: `color: #ffffff80` (= `--paragraphs`).

---

## 8. Shared primitives for designing secondary pages (already in the stylesheet — reuse, don't invent)

These classes exist in webflow.css (the protected pages used them). They ARE the design
language for /a-propos, /contact, /trouver-ma-voiture, /avis:

### Layout
- `.section-top` — page hero: flex column, centered, `padding: 13em 0 10em` (`.full`: min-height 100svh, justify flex-end, pb 3.8em · `.center`: flex 1, centered, overflow hidden).
- `.content` — centered container: `max-width: 88em; padding: 0 1.9em; text-align: center` (`.project` row-gap 6em / `.page` row-gap 8em, text-left).
- `.content-narrow` — `max-width: 47.2em; text-align: left`.
- `.section` (+ `.full` flex:1, `.margin` mb 10em) · `.section-call-to-action` — `padding: 15em 1.9em`, centered.
- `.footer` — flex space-between, `padding: 1.5em 1.9em`, gap 1.7em, centered text, `margin-top: auto` (sticks to bottom of flex body).

### Display headings
- `.heading-page` (13em Octane condensed) with `.text-span-wide` inline expanded spans — THE page-title pattern.
- `.letter-cta` / `.letter-contact` — giant Octane word as a hover-expanding link (wrapped in `.link-cta` / `.link-contact`), paired with `.text-cta` label.

### Text
- `.description` — centered uppercase intro: `.94em/1.7em`, ls .07em, max-width 30em, mt 2.6em (`.opacity` → .5).
- `.info-project`, `.info-work`, `.text-year`, `.info-contact`, `.heading-splash`, `.text-subtitle`, `.field-label` (opacity .35, mb -1.4em) — all variants of the §2.3 label style at opacity .5 unless noted.
- `.link` / `.rich-text-block a` — ink-fill hover: `box-shadow: inset 0 -1px 0 0 var(--heading)` → hover `inset 0 -24px 0 0` + `color: var(--background)`, .35s outQuad.
- `.link-footer` — label style at opacity .5 → 1 on hover, .3s outQuad.

### Buttons
- `.button` / `.submit-button` — pill: label typography, `background: #7d7d7d33; border-radius: 50em; padding: 2em 3.5em` (`.small`: 1.4em 2.4em), hover `#7d7d7d66`, .3s outQuad.
- `.button-light` — inverted: white bg, black text; hover → `#7d7d7d66` + white text.
- `.block-arrow` — round glass 4.6em circle (blur 20px, `#70707033`) holding a 1.25em `.arrow` icon — used as overlay affordance on media cards.

### Forms (contact / multi-step form)
- `.form-block` — `max-width: 43em; margin-top: 4em; width: 100%`.
- `.text-field` / `.textarea` — borderless except 1px bottom `var(--border)`; transparent bg; `font-size: 1.12em`; `height: 2.6em` (textarea min 7em/max 20em); `padding: 0 0 .6em`; focus → bottom border white, .3s outQuad.
- `.block-field` — row of fields, `gap 2em, margin-bottom 2.6em` → column at ≤479.
- `.success-message` / `.error-message` — tinted panels (§1.2), `padding: 1.5em`.

### Media/background helpers
- `.bg-gradient` / `.bg-blur` — black scrim + `linear-gradient(#0000, #000)` (blur 15px variant) over media.
- `.sticky-contact` — sticky stacked panels: `position: sticky; top: 12em` (+.7em per `.sticky-2/3/4`), `border-top: 1px solid var(--border)`, bg `radial-gradient(circle closest-corner at 50% 0%, #1d1d1d, var(--background))`, `padding: 4em 0 19em`.
- `.link-splash` — tile link: `background: #ffffff1a; color: #d9e9e980; padding: 6em 12%` → hover `#ffffff26` / `#d9e9e9`.
- Work grids: `.grid-work-1/2/3` (row-gap 9/9/5.5em; media heights 26/38/18vw; `.link-work-2 { width: 75% }` alternating left/right).

---

## 9. Next.js component architecture

### 9.1 Stack & conventions
- Next.js App Router + TypeScript. **No Tailwind.** Plain CSS: one `globals.css` + one CSS Module per component.
- GSAP (+ `@gsap/react` `useGSAP`) for all interactions in §5; `CustomEase` registered once with the two curves in §1.3.
- CSS Modules naming: file `ComponentName.module.css`; class keys camelCase mirrors of the Webflow names (`.sectionHero`, `.blockLetter`, `.bgVideoLetter`, `.navText`, `.blockUnderline`...) so any rule can be diffed against `webflow.css` 1:1. Keep the **values verbatim** (em-based, svh, vw) — do not "modernize" units.
- Element selectors, `:root` tokens, `@font-face`, heading scale, and §2.3 label style live in `globals.css` (label style as a `.u-label` utility or a CSS `@mixin`-style shared class exported from globals — recommend a global utility class `​.label` since 10+ components use it).
- Breakpoints: reuse exactly `@media screen and (max-width: 991px) / (max-width: 767px) / (max-width: 479px)` inside each module.

### 9.2 File layout

```
app/
  layout.tsx              ← html/body flex column, font preloads, lang="fr", metadata (title/desc/OG from home.html)
  globals.css             ← tokens §1, @font-face §2.1, base elements §2.2, label utility §2.3, easings
  page.tsx                ← Home: <Hero/>
  a-propos/  contact/  trouver-ma-voiture/  avis/   ← designed pages using §8 primitives
components/
  Navbar/Navbar.tsx + .module.css        ← bar, grid, brand, menu-button, MobileMenu panel
  Navbar/NavLink.tsx                     ← navText + blockUnderline + underline; GSAP hover §5.1
  Hero/Hero.tsx + .module.css            ← sectionHero, wrapperLetter, blockInfo; intro timeline §5.3
  Hero/LetterBlock.tsx                   ← letter + video; hover crossfade §5.2 (props: glyph, videoBase)
  Footer/  Button/  FormField/  PageHeading/  CtaWord/  ...   ← §8 primitives as needed
lib/
  gsap.ts                 ← gsap.registerPlugin(useGSAP, CustomEase); export eases
public/
  fonts/  OctaneGX.ttf, OakSansVF.woff2, OakSans-ItalicVF.woff2
  videos/ V|I|C|I2|C3|A2|R .mp4/.webm + *-poster.jpg          (copy from _reference/assets)
  logo.svg, logo-mobile.svg, favicon-32.png, icon-256.png, og.png
```

### 9.3 Implementation guardrails
- Letters: render glyphs as static text immediately with GSAP initial state applied via
  `gsap.set` inside `useGSAP` **before paint** (or inline `style` matching source:
  `opacity:0; transform: translate3d(3vw,0,0) rotateX(7deg) rotateY(70deg)`) — never SSR-flash.
- The `wdth` stretch stays a pure **CSS transition** (3s outQuart) — it is interruptible/reversible for free; GSAP only drives the video opacity + display.
- Hero letter data: `const LETTERS = [{g:'V',v:'V'},{g:'I',v:'C'},{g:'C',v:'I'},{g:'I',v:'C3'},{g:'C',v:'I2'},{g:'A',v:'A2'},{g:'R',v:'R'}]` (§4.4 — preserve the shuffle).
- All copy in French; `<html lang="fr">`; page title: «Vicicar - Trouvez votre voiture idéale 100% gratuit».
- `min-height: 100svh` (not dvh/vh) on hero — exact source value.
- Hover interactions: gate with `(hover: hover)` media query so touch devices don't stick; honor `prefers-reduced-motion`.
