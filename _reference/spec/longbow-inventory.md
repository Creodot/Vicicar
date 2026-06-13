# Longbow (db-longbow.webflow.io) — Interaction Inventory

Techniques catalogue extracted from the saved reference. Sources:
- `_reference/longbow/home.html` (full page markup, 85 kB)
- `_reference/longbow/longbow.css` (main Webflow CSS, 137 kB, fetched)
- `_reference/longbow/longbow-index.js` + `_reference/longbow/widgets/*.js` (the site's REAL animation code — readable, non-minified, lazy-loaded per `data-widget` from cdn.digitalbutlers.me; fetched for parameter extraction)

Stack confirmed from code: **Lenis + GSAP (ScrollTrigger + SplitText 3.14.2) + CSS keyframe marquees + IntersectionObserver reveals**. No WebGL anywhere. Webflow's own JS (jquery + webflow.schunk.*) only handles basic grid/embed plumbing — all the craft lives in the custom widget modules.

Fonts/feel: Bebas Neue (condensed display, uppercase, `letter-spacing: -.06em`, `line-height: .8em`) + EB Garamond italic variable (the "soft" counter-voice) + Geist Mono (tags/labels). Palette: black sections on a grey `--background: #888c8f` body, white type, `--primary-20: #fff3` hairlines — almost exactly Vicicar's token set (`--border: #fff3` matches 1:1).

---

## 1. Page structure & section rhythm

`<main data-role="main">` → 10 `<section class="section">` + 2 dark wrappers + footer block. Order:

1. **Preloader** (fixed overlay, line-drawing + logo + cursor-following ".loading" tag)
2. **Hero** — `section--hero`, `min-height: 100dvh - .625rem`. Glass card (headline + paragraph) on top of a full-bleed looping **boomerang video** (`new-longbow-hero-boomerang-video.mp4`), plus a giant "Longbow" heading-marquee strip.
3. **Speedster** / 4. **Roadster** — twin product scenes: full-bleed image background + a dark glass card (`card--dark`) with title, price, a small inline looping video thumb (`aspect-ratio: 1.65`), and a "Reserve +" button. Whole card is one `<a>` hover-trigger.
5. **Philosophy** — oversized editorial type composed PER WORD into the grid ("A" / "new" / "Species" placed in separate grid cells; "IS Born" is a marquee), + numbered card `.01` + masked image reveal.
6. **Creating** — image left, two numbered cards (`.02`, `.03`) right.
7. **Preview** — video + 2 photos, masked content reveals from random corners.
8. **Speed** (dark wrapper) — word-grid headline "The / Speed / Of / Lightness" (Speed = marquee), centered serif quote between giant SVG parentheses, "AS FEATURED IN" tag-marquee + 12-logo press marquee, 3 numbered cards.
9. **Gallery** — the showpiece: a **200dvh sticky scrub section** where a video grows from `min(50dvh)` to `min(100dvh)` height, with a **cursor-following marquee pill**, followed by 4 × `section--sm` (one media each, full-width, ~100dvh).
10. **Vision** (dark wrapper) — headline word-grid "A VISION BORN OF SPIRIT / FORGED (marquee) / BY REASON", design video with a blend-mode SVG icon, then **Team**: 3 portraits + signature images, separated by rules.
11. **Footer** — `section--footer` (~100dvh): full-bleed background video, nav links, round glass social buttons, contact card, giant "Longbow" heading-marquee, and a 2rem white **copyright marquee strip** at the very bottom.

**Section heights:** every section is a viewport-ish module: base `min-height: calc(100vh - 1.25rem)`; `--sm` = `min(100dvh, 63.75rem)`; `--lg`/`--lg-xl` = `min(150dvh, 95.625rem)`; `--sticky` = `min(200dvh, 127.5rem)`. The page breathes in ~100vh beats — this rhythm (one idea per viewport) is the single biggest pacing lesson.

**The drafting-table grid (signature, diverge):** a fixed `container--lines` overlay draws 1px vertical hairlines at 0/25/50/75/100% for the whole page height, and every section is a 4-col CSS grid whose rows are separated by `.horizontal-line` rules with little 7×7px white **squares** sitting at each 25% intersection (`top:-50%`, translate(-50%,-50%)) — a blueprint/registration-mark aesthetic. Max content width 120rem, gutters .625rem. This whole "engineering blueprint" identity is Longbow's most recognizable visual device → **we must NOT clone it**. Vicicar can keep the *idea* of hairline rules as section seams (we already have NavLink line sweeps and `--border: #fff3`) but without the square markers / full-page 25% grid.

## 2. Preloader

Not a counter — a **line-drawing choreography** (from `longbow-index.js`, gsap timeline, defaults `ease: "power1.inOut"`):
- wrapper fades in 0.3s → `.horizontal-1` scaleX 0→1 from left (0.5s) → `.vertical-1` scaleY 0→1 from bottom (0.5s, overlap `-=0.1`) → `.vertical-2` from top → `.horizontal-2` scaleX from right. The four lines sit at `50% ± 10vh`, framing a center 20vh square.
- As each line passes a progress threshold (0.4–0.6), a corner `center-sub-square` pops in: `{scale: 0→1, rotation: 45→0, duration: 0.4, ease: "back.out(1.5)"}`, stagger 0.1.
- Brand SVG fades in over 1.3s in the center square.
- A **cursor-following pill** `.loading` (body cursor hidden; pill lerps to mouse with `duration: 0.9, ease: "power2.out"`) whose background overlay `width: 0% → progress%` acts as the progress bar — progress is **simulated** (`+= Math.random()*15` every 200ms).
- Min display time 3s, hard timeout 5s, exit = whole preloader `autoAlpha→0, 0.3s, power2.inOut`; `body.js--locked` prevents scroll; main content children fade in via CSS `opacity .3s`.
- Behind it: blurred (500px!) overlay + tiled `noise.webp` at `opacity: .2`.

**Verdict for Vicicar:** the line-draw + square-pop language is distinctive but generic enough to adapt (we already do line sweeps). A 3s forced preloader is hostile on a static one-pager, though — if used at all, cap at ~1s or make it hero-integrated. The simulated-progress pill is a nice honest-fake pattern.

## 3. Full-bleed video scenes — framing & loading

- Videos are plain `<video playsinline muted loop autoplay poster=… >` inside `.background` (absolute inset 0, `overflow: hidden`, `z-index:-1`) → `.background__image` (`object-fit: cover`, `transform: translateZ(0)`). **Not** inset/rounded at rest: they bleed edge-to-edge inside the section, the 1px grid lines floating above them.
- Dimming: `.background--brightness { filter: brightness(75%) }` keeps white type legible — cheap and effective.
- Source files are **short "boomerang" loops** (filenames literally `*-boomerang.mp4`) — forward-back palindrome clips so the loop point is invisible. Hero/footer/gallery each get their own clip; one `hover-video` is reused for all blur-hover surfaces.
- `optimizeVideos()` (features.js): every video forced to `preload="metadata"`; non-autoplay videos `load()` only when 10% visible (IntersectionObserver); background videos get a `requestVideoFrameCallback` watchdog that drops `playbackRate` to 0.5 if frame delta > 50ms (graceful degradation on weak GPUs).
- Card thumb videos (`.card__video`, `aspect-ratio: 1.65`, clamp width ~126–244px): desktop = paused, **play on hover** of parent card, pause on leave; mobile (≤767) = forced autoplay.

**Vicicar mapping:** this is exactly the job for our 7 owned V/I/C/I2/C3/A2/R loops — full-bleed `brightness(.75)`-dimmed scenes below the hero, IO-gated play/pause, `.webm`+`.mp4`+poster already in /public. We go further than Longbow (they autoplay everything; we pause off-screen per our constraints).

## 4. Marquee mechanics

Custom class (marquee.js), not GSAP — **CSS keyframes** with JS doing the duplication math:
- Structure: `marquee-wrapper` (overflow hidden) → `[data-role=marquee-parent]` → `[data-role=marquee-moving-line]` (the animated flex row) → `[data-role=marquee-list]` (original content, cloned N times).
- JS measures content vs container, clones the list `2 × ceil(parentWidth/contentWidth)` times, then sets `animation-duration = copies × data-widget-duration` seconds. A ResizeObserver re-runs this; below a media rule it collapses to a single static list (that's how marquees "turn off" on mobile).
- Keyframes: `translateX(-50%) → translateX(0)` — i.e. content drifts **left-to-right**, linear, infinite. (An earlier `0 → -50%` definition is overridden later in the injected stylesheet.)
- `data-widget-duration` per instance: **3** for small pill tags (".Longbow", ".AS FEATURED IN", ".contacts") and single-word heading marquees, **5** for the giant hero/footer "Longbow" strips, **10** for press-logo and info/copyright strips. Small number = seconds per copy, so effective speed scales with content width — tags whip by, giant headings glide.
- Three scales of the same component: (a) tiny uppercase pill tags inside cards (`border-radius: .75rem`, `bg: #ffffff1a`, Geist Mono ~0.7–1rem); (b) **giant display marquees** `.heading-marquee` `clamp(10.6rem → 18.75rem)` / `--lg` up to **25.4rem** (~406px) Bebas at `line-height: .8`; (c) functional strips (press logos h ~5.4rem; footer legal-links strip on a white 2rem-high bar).
- Heading marquees start **paused** (`.js--disabled`) until their SplitText char reveal passes 50% progress, then the drift starts — reveal first, motion second.

**Vicicar mapping:** giant Octane marquee of a word like "VICICAR" or "VOTRE VOITURE" at 5s/copy, plus mono pill-tags; pause all under reduced-motion (Longbow does this only via the disable class).

## 5. Line-sweep reveal pattern

- Static structure: `.horizontal-line` 1px `#fff3` + `.horizontal-line-full-width` (100vw centered) + squares; `.vertical-line` 1px at 25/50/75%.
- The *animated* sweeps live in the preloader (scaleX/scaleY from a directional `transformOrigin`, 0.5s power1.inOut) — in-page rules are static. The sweep grammar to copy: **scaleX: 0→1 with alternating origins (left, then right), ~0.5s, overlapped -0.1s, child accents popping with back.out(1.5) at 40–60% progress of the parent line.**
- Hairline color `--primary-20: #fff3` = Vicicar's `--border` exactly.

## 6. Headline reveal style (`data-widget="text-split"`)

GSAP **SplitText** (`type: "chars,words,lines"`, `mask: "lines"` when `data-line-animation` is set → masked line wrappers with `overflow: clip`):
- Wrapper: `fromTo {opacity:0, rotationZ:1} → {opacity:1, rotationZ:0, duration:0.2, power2.out}` — note they tween a *non-zero initial rotationZ back to 0*, i.e. the exact phantom-rotationZ trick our repo gotcha describes; do it the same way (fromTo with explicit rotation values).
- Chars: `fromTo {y:"150%", opacity:0, rotationZ:1} → {y:0, opacity:1, rotationZ:0}`, `duration` = `data-duration` (default **0.5**), `stagger: {amount: data-stagger ?? chars/10}`, `ease: "power2.out"`, trigger `start: "center bottom"` (fires once as the element crosses the fold).
- Big serif paragraph in "Speed" uses `data-line-animation data-stagger="0.8" data-duration="1" data-start-opacity="1"` → masked **per-line rise** (lines slide up out of clipped masks), slower and statelier than the char version.
- Headline composition trick: each WORD of a display headline is its own grid item (`heading-marquee--no-pad` etc.) placed in different cells — words revealed independently, one of them being a live marquee. Editorial, very strong. The two-font alternation (Bebas roman + Garamond italic on the second line) is their voice; ours is Octane + wdth axis (e.g. stretch instead of italic).

## 7. Hover patterns

All driven by two tiny CSS rules + per-element `data-role` markup (works with zero JS for the visual part):
- `[data-role='hover-trigger']:hover [data-role='hover'] { opacity: 1 }` — a hidden absolutely-positioned layer containing a **blurred looping video** (`.background__image--blur { filter: blur(2.5rem) }`) fades in (`transition: opacity .3s`) behind/inside the card. Used on product cards, header, social buttons. Cheap "living glass" effect: the card seems lit from behind by moving footage.
- `[data-role='hover-trigger']:hover [data-role='image'], …[data-role='button'] { border-radius: 1.25rem }` with `transition: border-radius .3s ease` — square media thumbs and buttons **round their corners on hover**. Tiny, memorable, cheap.
- Card hover also starts the thumb video playing (JS mouseenter/leave; mobile gets always-on instead — no hover-gated content).
- Nav links: char-by-char **roll-up swap** — duplicate italic copy sits below, on hover original chars `translateY(-125%)` and italic chars rise to 0, 30ms/char setTimeout cascade, `transition: transform .4s ease-in-out` (CSS), wrapper `overflow: hidden`. Same as our NavLink sweep family; the roman→italic font swap is their twist (ours: wght/wdth axis shift).
- Footer marquee links: plain underline on hover.
- `card-animation` (entrance, not hover): `set {opacity:0, y:50, scale:0.85}` → on 50% visibility `to {opacity:1, y:0, scale:1, duration:1.2, ease:"power2.inOut"}`, once.

## 8. Content / image reveals (`content-reveal`)

Pure CSS mask trick: `mask: linear-gradient(white,white); mask-size: 0% 0%; opacity: 0; transition: mask-size, opacity 1250ms ease-in-out`, `mask-position` set from `data-reveal="left bottom"` (or randomized corner if absent). IO at 50% visibility flips `data-reveal-state="finish"` → `mask-size: 101% 101%` — the image **wipes open diagonally from a corner**. One class, nine directions, GPU-cheap, no JS animation. Strongly worth stealing (it reads as bespoke but is ~20 lines).

## 9. Parallax (`image-parallax`)

Media inside `.background` is oversized by viewport-dependent scale (**1.2 / 1.3 (>900px) / 1.4 (>1200px viewport height)**) then scrubbed `y: -movement → +movement` with `scrollTrigger {start:"top bottom", end:"bottom top", scrub:true, invalidateOnRefresh:true}` where `movement = (imageH - containerH)/2`. Applied to nearly every image AND video. Transform-only, 60fps-safe.

## 10. Sticky gallery scene (`gallery-sticky`)

Desktop only (`gsap.matchMedia("(min-width: 992px)")` — they already use matchMedia, like us):
- A 200dvh `section--sticky`; inside, `content-sticky` is `position: sticky` (CSS does the pinning, **no ScrollTrigger pin**) while GSAP scrubs the media box `height: min(50dvh) → min(100dvh), width→100%` over `start:"top center" end:"bottom top"` — the video **swells to full-bleed as you scroll**, then unsticks.
- Overlaid: a **cursor-following marquee pill** ("Driving Like It Used To Feel / An escape from the mediocre /") — `gsap.to {x,y, duration:1, ease:"power3.out"}` on mousemove (lerp-follow), visibility gated by ScrollTriggers; at section bottom it docks to the bottom edge and swaps to a legal-disclaimer text (`data-new-text`), fading 0.5/0.3s power3.out. `cursor: none` over the zone.
- Below 992px: no follower, no scrub; the marquee strip becomes a static full-width bar (`opacity:1, width:100%`), sticky section flattens to `height: 25rem`.

CSS-sticky + scrub-the-size (instead of ScrollTrigger pinning) is the most robust pin technique for us — no pin-spacer, no Lenis fight.

## 11. Smooth scroll (Lenis) — their exact bridge

```js
lenis = new Lenis({ smoothWheel: true, duration: 2, wheelMultiplier: 1 });
lenis.on('scroll', ScrollTrigger.update);
ScrollTrigger.scrollerProxy(document.body, { scrollTop(v){...lenis.scrollTo/scroll}, getBoundingClientRect(){viewport} });
ScrollTrigger.defaults({ scroller: document.body });
requestAnimationFrame loop calling lenis.raf(time);  // self-rAF, not gsap.ticker
```
`duration: 2` is notably floaty — half of the "expensive" feel is just this number. They use their own rAF; our constraint (gsap.ticker drives `lenis.raf`, `lagSmoothing(0)`) is the cleaner modern bridge and we should keep it. Note their `data-lenis-prevent` on the nav menu (scrollable overlay) — remember it for any scrollable sub-area. They do NOT disable Lenis for reduced-motion (we must).

## 12. Nav behavior on scroll

- Header is a **fixed centered glass pill** (`top:.625rem; left:50%; max-width:29.625rem; border-radius:.75rem; backdrop blur ~100px` via `::before`), 3-col grid: burger / logo / "Models" ghost button. It never hides or shrinks on scroll — **scrolling just closes the menu** (`window scroll → closeMenu()`), as does outside-click and resize.
- Menu opens **downward inside the pill** (accordion): height 0→scrollHeight, `transition: opacity 300ms ease, height 400ms ease-in-out`, aria-expanded/hidden managed; burger lines rotate ±45° (`transform .35s ease-in-out`). Menu contains two video mini-cards (model links) + anchor links + email. Reduced-motion: `transition: none` on the menu (they do handle this one).
- On hover the whole header shows a blurred-video `hover` layer.
- ≤767px: pill becomes a full-width transparent bar with left/right hairline borders, top:0.

## 13. Footer treatment

A final ~100dvh scene, not an afterthought: background boomerang video (dimmed), nav-link row with the roll-up hover, glass circle socials (each with its own blurred-video hover layer), contact glass card with a ".contacts" pill-marquee, the giant "Longbow" display marquee as a sign-off, and underneath the layout a 2rem **white** marquee strip carrying © + legal links (duration 10, links underline on hover). The inverted-color crawl strip is a nice full-stop. For Vicicar the existing `<Footer/>` stays — but a pre-footer "FinalCta" scene with full-bleed video + giant marquee can deliver this energy before our normal footer.

## 14. Page transitions & misc

- `.page-transition` fixed overlay: leave = content fades 0.1s + overlay (blurred poster image + noise) fades in 1.1s power2.inOut, then `location.href`; anchors/mailto excluded. Mostly irrelevant to our one-page landing; ours could reuse the idea for `/trouver-ma-voiture` entry (probably skip — static export + 1.1s delay hurts).
- Noise texture overlay (tiled webp, opacity .2) on all blurred surfaces — kills banding in gradients/blur. Cheap and worth copying onto our glass surfaces.
- `::selection` styled; scrollbar hidden on html (Lenis owns scroll feel).
- Easing conventions overall: **power1/power2.inOut** for structural moves, **power2/power3.out** for follows and entrances, `back.out(1.5)` only for tiny accents, linear only for marquees/parallax. CSS transitions: 0.3s ease default, 0.4s char rolls, 1250ms content-mask reveals.

## 15. Mobile simplification map (≤991 / ≤767 / ≤479)

| Pattern | Desktop | Mobile behavior |
|---|---|---|
| Vertical grid lines | 0/25/50/75/100% | ≤991: only 50% remains; ≤767: none (edge lines only) |
| Giant heading-marquees | animated strips | ≤767: `display:none`, replaced by static `.heading-mobile` (Bebas 5.6–8.4rem, uppercase, centered) — **marquees off, words still huge** |
| Pill tag marquees | animated | hidden (`tag-wrapper--no-mobile`) or static |
| Press-logo marquee | desktop strip hidden | dedicated `marquee-wrapper--mobile` shown (still animated — it's the one moving thing kept) |
| Sticky gallery scrub + cursor follower | 200dvh pin + follower | ≤991: section `height:25rem`, no scrub, follower replaced by always-visible static info bar |
| Card hover video-play | mouseenter/leave | ≤767: videos autoplay always; hover layers forced `opacity:1` (no hover-gated content) |
| Section heights | ~100dvh modules | ≤767: `min-height: 25rem` (content-height modules; the page densifies) |
| Speed quote brackets | giant SVG parentheses | hidden |
| Cards `.card--no-mobile` / `--mobile-show` | desktop layout | duplicated/reordered card instances per breakpoint (content parity, different slots) |
| Header pill | centered floating pill | full-width bar, hairline side borders, menu cards stay (videos autoplay) |
| Sections per breakpoint | 4-col grid w/ explicit `grid-area` per child | 2-col (991), then 1-col stacking via per-node grid-area overrides |

Their philosophy: on mobile, **kill scroll choreography, keep scale and rhythm** — big static type, autoplaying small loops, hairlines as structure. That matches our constraints (no pins/scrub under reduced-motion or on small screens; videos IO-gated).

---

## DISTINCTIVE — MUST DIVERGE (do not copy)

1. **The 25% blueprint grid + 7px square registration marks** (full-page vertical lines, squares at intersections, square corner accents everywhere) — this *is* the Longbow brand. Use hairlines as seams only, no square markers, no full-height 25/50/75 columns.
2. **Bebas + EB Garamond italic pairing** and the roman→italic hover/word alternation — replaced by Octane wght/wdth axis play (stretch, not italics).
3. **Preloader square-and-lines logo choreography** with the `.loading` cursor pill — adapt the line-sweep grammar at most; no center-square logo ritual, no 3s lock.
4. All **copy, names, prices, "Reserve +"** CTAs, press logos, team/signature blocks, the parenthesis-quote composition, the steering SVG icon — Vicicar copy is French, service-led (« Trouver ma voiture », expert humain, 100 % gratuit).
5. Their **videos/images/posters** (obviously) — we own seven better-suited loops.
6. The exact **glass pill header with embedded video mini-cards** — our Navbar is untouchable anyway.
7. The grey `#888c8f` body behind black sections — Vicicar stays pure black (`--background`).

## TOP TECHNIQUES TO ADAPT (ranked)

1. **Full-bleed boomerang video scenes** below the hero — one owned loop per ~100vh scene, `brightness(.75)`, posters + IO play/pause.
2. **Viewport-beat section rhythm** (`min(100dvh, cap)` modules, hairline seams) replacing the v2 sections.
3. **CSS-sticky + GSAP scrub "video swells to full-bleed"** gallery scene (no ScrollTrigger pin), desktop-only via matchMedia.
4. **Giant display marquees** (3 scales: pill tags ~3s, display word ~5s, info strip ~10s; CSS keyframes + clone-count duration math; static huge type on mobile).
5. **Masked SplitText line/char reveals** (chars y:150% stagger amount≈chars/10 power2.out; masked line rise for paragraphs) — with the fromTo rotationZ:1→0 phantom-fix they also use.
6. **Corner mask-wipe content reveal** (mask-size 0→101%, 1250ms ease-in-out, data-driven 9 directions) for images/cards.
7. **Blurred-video hover glass + border-radius morph** (opacity .3s + radius 0→1.25rem .3s) on cards/CTAs, reusing our letter loops as the hover light source.
8. **Lenis bridge + video hygiene** (duration ~1.6–2 feel; `data-lenis-prevent`; preload=metadata, IO-gated load/play, playbackRate watchdog).
9. Scrub **media parallax** (oversize 1.2–1.4×, y scrub top-bottom→bottom-top) as the default texture on every media block.
10. **Noise overlay on glass** to de-band blurs.
