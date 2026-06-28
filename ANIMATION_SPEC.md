# Iceberg Partners LLC — Animation Spec

> Binding reference for all motion (as-built). Pair with `DESIGN_SYSTEM.md` for color/type. Read
> `README.md` first for intent. The scroll choreography is the product — these are the timings and
> curves the implementation actually uses (in `main.js`). Refine *by feel* within the ranges.

---

## 1. Scroll model

A **pinned stage + scroll-progress** model.

- A tall **scroll-track** defines how much scrolling equals a full reveal. Inside it, a **stage**
  (`position: sticky; top: 0; height: 100vh`) stays fixed while the track scrolls.
- A single normalized progress **`p ∈ [0, 1]`** is computed each frame from the track's position:
  `p = clamp01(-track.getBoundingClientRect().top / (track.offsetHeight - innerHeight))`. Every
  scroll-driven animation is a function of `p`.
- **Smooth scroll on pointer devices only:** [Lenis] (`lerp ≈ 0.09`) is initialized only when the
  pointer is *fine* (`matchMedia('(pointer: coarse)')` is false). **On touch/mobile, Lenis is
  disabled** and native scroll is used — smooth-scroll libraries fight native momentum there and
  cause jank. A single `rAF` loop runs regardless (driving `p` from `getBoundingClientRect`), so
  the visuals work with or without Lenis.

**Track length:**

| Viewport | Track height | Why                                  |
|----------|--------------|--------------------------------------|
| Desktop  | `~360vh`     | a paced reveal without dragging      |
| Mobile   | `~280vh`     | fewer swipes; keep the arc tight     |

---

## 2. Easing (as implemented in `main.js`)

```js
clamp01(t)   = min(1, max(0, t))
sub(p,s,e)   = clamp01((p - s) / (e - s))        // local t within a sub-window [s,e]
easeEmerge(t)= 1 - (1 - t)^3                      // cubic-out: elegant element entrances
easeInOut(t) = t<0.5 ? 2t² : 1 - (-2t+2)²/2       // quad in-out: deliberate transitions
trackAnchors(p, [[p0,v0],[p1,v1],…])              // piecewise-linear interpolation across anchors
```

**Scrubbed vs. discrete:**

- The **camera/world descent and background** track scroll **near-linearly** (`trackAnchors`)
  so motion feels physically connected to the wheel/finger.
- **Discrete reveals** (mission text, the gleam, wordmark exit, the surface-line morph) each get a
  sub-window of `p`, and within it their value is **eased** via `easeEmerge` or `easeInOut` on the
  remapped local `t`. This makes them feel composed rather than mechanical.

---

## 3. Master timeline (phases over `p`)

Four beats matching `README.md` §3. Ranges overlap so beats hand off smoothly.

| `p` range     | Beat                       | What happens                                                                 |
|---------------|----------------------------|------------------------------------------------------------------------------|
| `0.00–0.08`   | **Brand surface**          | Almost nothing moves. Navy field + gold lockup, composed. A thin **straight gold waterline** rests low (~82vh). Gold scroll cue loops. |
| `0.08–0.30`   | **Threshold**              | Background deepens navy→deeper navy; **at `p≈0.18–0.30` a specular gleam sweeps the gold lockup**; gold light shafts fade in. |
| `0.30–0.62`   | **Revelation**             | The submerged **mass rises** into view; the **straight waterline morphs into its jagged rim and rides it up** (`p≈0.31–0.52`); facets traced in gold. The payoff of scale. |
| `0.55–0.84`   | **Mission emerges**        | Eyebrow → sentence 1 (lead) → sentence 2 (body) stagger in, ivory with gold emphasis, anchored in the deep. (Overlaps the revelation's tail.) |
| `0.85–1.00`   | **Stillness (the deep)**   | Everything settles into near-black navy; vignette deepens; the mass dims behind the text; footer fades in. Calm. |

---

## 4. Per-element animation (driven by `p`)

### 4.1 Background navy descent
- **Drives on:** `p`, near-linear, as an **opacity cross-fade of 5 stacked gradient layers**
  (`DESIGN_SYSTEM.md` §2.1) — *not* a repainted gradient.
- Layer `n` opacity = `1 - sub(p, zoneStart, zoneEnd)`, zones: s0 `0–0.25`, s1 `0.25–0.45`,
  s2 `0.45–0.70`, s3 `0.70–1.00`; s4 (abyss) stays opaque underneath. Compositor-only → cheap.

### 4.2 Gold surface line — straight waterline → iceberg rim **(the signature gesture)**
One SVG `<path>` of **7 control points** that morphs between a flat line and the iceberg's top
shoulder. The shoulder's live screen position is derived **analytically** from the mass transform
(no `getBoundingClientRect` → no frame lag, no reflow).

- **Flat shape (rest):** points at x `[6,20,35,50,65,80,94]` %vw, all at y `82` %vh (`FLAT_Y`) —
  a wide straight line just above the scroll cue.
- **Jagged target:** the mass's top-shoulder profile, as fractions of its `560×700` viewBox —
  `fx = [.061,.268,.382,.536,.689,.839,.943]`, `fy = [.040,.017,.049,.011,.043,.026,.063]` —
  converted to screen-% using the mass's current `translateY`/`scale` (§4.4).
- **Three decoupled factors** so the line never lags the rising mass:

  | Factor | Window (`p`) | Easing      | Effect                                                            |
  |--------|--------------|-------------|-------------------------------------------------------------------|
  | `ride` | `0.31–0.44`  | `easeInOut` | baseline lerps from `FLAT_Y` to the shoulder's **average** height → the line glues to the iceberg top and rides it up |
  | `jag`  | `0.33–0.52`  | `easeInOut` | each point's vertical **bump** (offset from the shoulder average) grows in |
  | `wid`  | `0.31–0.50`  | `easeInOut` | x narrows from the wide flat spread to the shoulder's x positions |

  Per point: `x = lerp(FLAT_X, shoulderX, wid)`, `y = baseY + (shoulderY − avgShoulderY) · jag`,
  where `baseY = lerp(FLAT_Y, avgShoulderY, ride)`.
- **Opacity:** `1` until `p=0.88`, then fades to ~`0.15` as the mass recedes behind the mission.
- **Stroke:** `--gold`→`--gold-light` linear gradient, **`gradientUnits="userSpaceOnUse"`** (so a
  perfectly flat zero-height line still paints), transparent at both ends, `vector-effect:
  non-scaling-stroke` (~1.5px), soft gold `drop-shadow` glow (removed on mobile).

**One uniform contour.** `#surfacePath` draws only the **top shoulder**. The iceberg's **sides +
bottom** are a second path `#bergOutline` in the *same* `#surface` SVG, computed from the same mass
transform (silhouette indices 6→0) at the **same 1.5px non-scaling stroke / same gold** — so the
whole iceberg reads as one continuous gold line of uniform weight (not a faint mismatched rim).
`#bergOutline` fades in over `p 0.40–0.54` (as the mass rises) and dims slightly past `0.90`. The
mass SVG itself carries **no outline stroke**; its interior gold lines are a few mesh-aligned
ridges (`DESIGN_SYSTEM.md` §6).

### 4.3 ~~Iceberg above-water tip~~ — **removed**
There is no separate above-water tip. The surface *line* (§4.2) is the surface and becomes the
rim.

### 4.4 Iceberg — below-water mass (the reveal)
Centered element (`transform-origin: center`), `translateY` in vh, `scale`, opacity:

| `p`   | translateY | opacity | scale | notes                                          |
|-------|------------|---------|-------|------------------------------------------------|
| 0.30  | `70vh`     | 0.0     | 1.00  | just below the fold                            |
| 0.40  | `34vh`     | 1.0     | 1.04  | rising into view; the surface line is catching its shoulder |
| 0.62  | `0vh`      | 1.0     | 1.15  | dominant; camera nearest the mass              |
| 0.88  | `-18vh`    | 0.25    | 1.18  | recedes/dims so the mission text is clean      |
| 1.00  | —          | 0.18    | —     | faint gold-edged silhouette behind the text    |

Tonal navy fill with gold hairline facets (`DESIGN_SYSTEM.md` §6).

### 4.5 Wordmark `ICEBERG PARTNERS LLC` (gold) — gleam, then drift-out
The lockup is **gold throughout**. Rest at `translateY: -2vh` (just above center).

| Sub-window   | Property        | From → To                          | Easing          |
|--------------|-----------------|------------------------------------|-----------------|
| `0.18–0.30`  | **gleam sweep** | highlight band crosses the letters: `--gleam-pos` `-15% → 115%` | `easeInOut` |
| `0.30–0.46`  | translateY      | `-2vh` → `-42vh`                   | `easeEmerge`    |
| `0.30–0.46`  | opacity         | `1` → `0`                          | `easeEmerge`    |
| `0.30–0.46`  | scale           | `1.00` → `0.96`                    | `easeEmerge`    |

- **Gleam technique:** the lockup is filled with a `linear-gradient` (gold, with a `--gold-light`
  band) via `background-clip: text`; `--gleam-pos` animates the band across by local `t`. Reads as
  light catching metal — a single subtle pass. Then the lockup rises and dissolves like a bubble.
- The waterline no longer rises *through* the wordmark (it stays low and morphs); the gleam is a
  self-contained moment just before the drift-out.

### 4.6 Mission — eyebrow + sentence 1 (lead)
- **Eyebrow** (`NEW YORK`): sub-window `0.55–0.70`, `easeEmerge`. opacity `0→1`, translateY
  `16px→0`.
- **Lead** (sentence 1): sub-window `0.58–0.74`, `easeEmerge`. opacity `0→1`, translateY `28px→0`,
  **blur `8px→0` (desktop only — dropped on touch)**.

### 4.7 Mission — sentence 2 (body)
- Sub-window `0.66–0.84` (starts after the lead), `easeEmerge`. opacity `0→1`, translateY
  `20px→0`, **blur `6px→0` (desktop only)**. Gold emphasis phrases reveal with the body.

### 4.8 Gold light shafts
| `p`   | opacity | notes                              |
|-------|---------|------------------------------------|
| 0.18  | 0.0     | begin near the surface             |
| 0.32  | 0.18    | full (subtle), just below surface  |
| 0.62  | 0.12    | thinning                           |
| 0.90  | 0.06    | faint in the deep                  |
| 1.00  | 0.05    | residual                           |
- Plus a CSS-based **ambient horizontal drift** (~`14–18s`, small amplitude). 3 shafts desktop;
  one dropped + blur lightened on mobile.

### 4.9 ~~Marine motes~~ — **removed**
The drifting pale-gold particle canvas has been removed entirely.

### 4.10 Scroll cue (gold)
- Outer opacity = `1 - sub(p, 0.02, 0.08)` → fades out reliably on first scroll.
- The ambient **bob** (translateY + opacity pulse, `1.6s ease-in-out alternate`) lives on an
  **inner** element, so it can't override the outer scroll-driven fade. Visible only at the top.

### 4.11 Footer label
- Sub-window `0.90–1.00`, `easeEmerge`. opacity `0→1`, translateY `12px→0` (kept horizontally
  centered with `translateX(-50%)`).

### 4.12 Vignette
- Opacity = `clamp01(p) · 0.5`, near-linear — edges deepen into the abyss.

---

## 5. Depth ordering (z, front → back)

```
scroll cue / footer / vignette / grain  >  wordmark  >  mission  >  surface line  >  iceberg mass  >  shafts  >  background layers
```
The surface line sits above the mass (it is its rim) and below the mission/wordmark. Depth reads
from the mass's slower rise + scale and the atmosphere, not from obvious layer-sliding.

---

## 6. Non-scroll (time-based) animation

- **Page load-in:** the whole stage fades `opacity 0 → 1` over `600ms ease-out` once (set in JS
  via a double-`rAF`). The page arrives composed and quiet — no loud intro.
- **Ambient loops (always running):** gold-shaft horizontal drift (~14–18s); scroll-cue bob
  (`1.6s`).
- **Hover (footer link only):** color/opacity `200ms ease`; focus ring appears instantly.

---

## 7. Performance rules (non-negotiable)

- **Animate only `transform` and `opacity`.** The background is an **opacity cross-fade of stacked
  gradient layers** — never a repainted full-screen gradient on scroll.
- **The surface line is positioned analytically** from the mass transform — no per-frame
  `getBoundingClientRect`, no layout thrash.
- **Blur is expensive:** limited to the two mission reveals, and **disabled on touch devices**
  (opacity + translateY only there).
- **One `rAF` loop:** read the (smooth or native) scroll once per frame, compute `p`, set the
  `--p` CSS var, and apply the handful of transforms/opacities. The scene block only runs when `p`
  actually changed.
- `will-change: transform/opacity` on the few animated layers.
- **Mobile:** Lenis off; grain off; one shaft dropped + lighter blur; surface-line glow off;
  shorter track. Target **60fps**; no jank at the gleam or the morph.

---

## 8. Reduced motion (`prefers-reduced-motion: reduce`)

A calm, equivalent experience — same content, no vestibular triggers:

- **Disable** smooth-scroll scrubbing, the camera descent, parallax, drift, the gleam, blur, the
  iceberg mass, and the surface-line morph.
- The page becomes a **simple, naturally-scrolling** layout (`.stage` static with a fixed
  navy→deep gradient): brand surface (navy + gold lockup) → mission statement, with elements
  fading in gently via `IntersectionObserver` (opacity only, short, ease-out). The `.bg` layers,
  iceberg mass, surface line, and scroll cue are `display: none`.
- The mission text (ivory body, gold emphasis) and footer remain reachable and legible.

---

## 9. Implementation reference (the real shape, condensed)

```js
import Lenis from 'lenis';
const coarse = matchMedia('(pointer: coarse)').matches;
const lenis = !coarse && window.Lenis ? new Lenis({ lerp: 0.09 }) : null;

const clamp01 = t => Math.min(1, Math.max(0, t));
const sub = (p,s,e) => clamp01((p - s) / (e - s));
const easeEmerge = t => 1 - Math.pow(1 - t, 3);
const easeInOut  = t => t < .5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2;

function frame() {
  const r = track.getBoundingClientRect();
  const p = clamp01(-r.top / (track.offsetHeight - innerHeight));
  stage.style.setProperty('--p', p);

  // background: cross-fade stacked layers (compositor-only)
  bgEls.forEach((el,i) => el.style.opacity = 1 - sub(p, ZONES[i][0], ZONES[i][1]));

  // mass: translateY / scale / opacity from anchors (§4.4)
  const massY = trackAnchors(p, [[.30,70],[.40,34],[.62,0],[.88,-18]]);
  const massSc = trackAnchors(p, [[.30,1],[.40,1.04],[.62,1.15],[.88,1.18]]);
  mass.style.transform = `translateY(${massY}vh) scale(${massSc})`;

  // surface line: derive shoulder screen-% from the mass transform, then morph (§4.2)
  const massH = massW * 700/560;
  const bL = innerWidth/2 - massW*massSc/2, bT = innerHeight/2 + massY/100*innerHeight - massH*massSc/2;
  const ride = easeInOut(sub(p,.31,.44)), jag = easeInOut(sub(p,.33,.52)), wid = easeInOut(sub(p,.31,.50));
  // …lerp the 7 control points (flat → shoulder) and setAttribute('d', …)

  // wordmark gleam + drift, mission lead/body, shafts, vignette, footer, cue … per §4
}
if (lenis) lenis.on('scroll', frame);
requestAnimationFrame(function raf(t){ if (lenis) lenis.raf(t); frame(); requestAnimationFrame(raf); });
```

> The **values above are what's binding**, not this sketch. Whatever the edit: honor §7
> (transform/opacity, no repaint) and §8 (reduced motion).

[Lenis]: https://github.com/darkroomengineering/lenis
