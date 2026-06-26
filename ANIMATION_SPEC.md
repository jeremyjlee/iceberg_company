# Iceberg Partners LLC — Animation Spec

> Binding reference for all motion. Pair with `DESIGN_SYSTEM.md` for color/type. Read
> `README.md` first for intent. The scroll choreography is the product — implement these
> timings and curves precisely, then refine *by feel* within the stated ranges.

---

## 1. Scroll model

A **pinned stage + scroll-progress** model — the most robust pattern across stacks.

- A tall **scroll-track** defines how much scrolling equals a full reveal. Inside it, a
  **stage** (`position: sticky; top: 0; height: 100vh`) stays fixed while the track scrolls.
- Compute a single normalized progress **`p ∈ [0, 1]`** = how far the track has scrolled
  through its own length. Every scroll-driven animation is a function of `p`.
- **Smooth scroll is required** for the gliding-descent feel — use [Lenis] (lerp ≈
  `0.08–0.10`) or GSAP ScrollSmoother. Raw native scroll feels too abrupt for this arc.

**Track length (tune by feel):**

| Viewport | Track height | Why                                       |
|----------|--------------|-------------------------------------------|
| Desktop  | `~360vh`     | a paced reveal without dragging           |
| Mobile   | `~280vh`     | fewer swipes; keep the arc tight          |

> GSAP alternative: `ScrollTrigger` with `pin: true, scrub: true` over the same track; author
> the phases below as one timeline (timeline 0→1 == `p`).

---

## 2. Easing tokens

Define once, reuse. (CSS custom props; equivalent in JS/GSAP.)

```css
--ease-descent: cubic-bezier(0.33, 0.00, 0.20, 1.00); /* camera settling, decelerates to rest */
--ease-emerge:  cubic-bezier(0.16, 1.00, 0.30, 1.00); /* expo-out: elegant element entrances  */
--ease-surface: cubic-bezier(0.65, 0.00, 0.35, 1.00); /* in-out: deliberate threshold crossing */
--ease-drift:   linear;                               /* ambient loops (or a sine wave)         */
```

**Crucial nuance — scrubbed vs. discrete:**

- The **camera/world descent and background color** track scroll **near-linearly** so the
  motion feels physically connected to the visitor's finger/wheel. Don't heavily ease the
  camera against scroll, or it feels disconnected.
- **Discrete reveals** (mission text, the gold gleam, wordmark exit, shaft fade) each get a
  sub-window of `p`, and within it their value is **eased** (apply the curve to the local,
  remapped `t`). This is what makes them feel composed rather than mechanical.

Helper: `localT = clamp((p − start) / (end − start), 0, 1)`, then `eased = ease(localT)`.

---

## 3. Master timeline (phases over `p`)

Four beats matching `README.md` §3. Ranges overlap so beats hand off smoothly.

| `p` range     | Beat                       | What happens                                                                 |
|---------------|----------------------------|------------------------------------------------------------------------------|
| `0.00–0.08`   | **Brand surface**          | Almost nothing moves. Navy field + gold lockup, composed. Tip small. Gold scroll cue loops. A brief deliberate pause before descent. |
| `0.08–0.30`   | **Threshold (crossing)**   | Camera descends; the thin **gold waterline** rises and passes off the top; background deepens navy→deeper navy; **at `p≈0.20–0.28` a specular gleam sweeps across the gold lockup** and gold light shafts fade in. |
| `0.30–0.62`   | **Revelation (the mass)**  | The submerged mass scrolls into full view in deeper navy, its facets traced in gold; parallax layers separate; marine motes appear; shafts thin. The payoff of scale. |
| `0.55–0.85`   | **Mission emerges**        | Sentence 1 reveals first, sentence 2 staggers in, ivory with gold emphasis, anchored in the deep. (Overlaps the tail of the revelation.) |
| `0.85–1.00`   | **Stillness (the deep)**   | Everything settles into near-black navy; vignette deepens; descent decelerates to rest (`--ease-descent` tail); optional footer label fades in. Calm. |

---

## 4. Per-element animation (driven by `p`)

Values are anchors — interpolate between them. "vh/vw" = % of viewport. Easing column says
whether the property tracks scroll linearly or is eased within a sub-window.

### 4.1 Background gradient (the navy descent)
- **Drives on:** `p` over `0.00→1.00`, **near-linear**.
- Interpolate between the stops in `DESIGN_SYSTEM.md` §2.1 (surface `#1F2B48` → abyss
  `#060A16`). JS lerp of the two gradient stops, or cross-fade stacked gradient layers.

### 4.2 Gold waterline / surface
| `p`   | translateY | opacity | notes                                       |
|-------|------------|---------|---------------------------------------------|
| 0.08  | `32vh`     | 1       | thin gold line resting in the upper third   |
| 0.22  | `8vh`      | 1       | approaching the top; gleam triggers here    |
| 0.30  | `-12vh`    | 0       | passed off-screen; we're below the surface  |
- **Easing:** `--ease-surface` across `0.12→0.30` for a deliberate pass-through. Keep the line
  thin and precious (`--gold` / `--gold-light`), ~1px with a soft glow.

### 4.3 Iceberg — above-water tip
| `p`   | translateY | opacity | scale | notes                       |
|-------|------------|---------|-------|-----------------------------|
| 0.00  | `0`        | 1       | 1.00  | small, composed             |
| 0.30  | `-30vh`    | 1       | 1.00  | rising with the camera      |
| 0.46  | `-64vh`    | 0       | 1.00  | exited the top              |
- Tip parallax factor ≈ **1.0** (it's "at" the surface, exits first). Gold rim where it meets
  the waterline.

### 4.4 Iceberg — below-water mass (the reveal)
| `p`   | translateY | opacity | scale | notes                                          |
|-------|------------|---------|-------|------------------------------------------------|
| 0.30  | `70vh`     | 0.0     | 1.00  | just entering from below                       |
| 0.40  | `34vh`     | 1.0     | 1.04  | rising into view                               |
| 0.62  | `0vh`      | 1.0     | 1.15  | dominant; camera nearest the mass              |
| 0.88  | `-18vh`    | 0.25    | 1.18  | recedes/dims so the mission text is clean      |
- Mass parallax factor ≈ **0.7** (slower than foreground motes → depth). Tonal navy fill with
  gold hairline facets; by `~0.9` it's a faint gold-edged silhouette behind/around the text —
  don't let it fight the mission for attention.

### 4.5 Wordmark `ICEBERG PARTNERS LLC` (gold) — the signature
The lockup is **gold throughout** (no color change). The signature is a **specular gleam** at
the threshold, then a drift-up dissolve. Both lines move as one unit.

| Sub-window   | Property            | From → To                          | Easing          |
|--------------|---------------------|------------------------------------|-----------------|
| `0.00–0.30`  | translateY          | `0` (pinned center, ~50vh)         | —               |
| `0.18–0.30`  | **gleam sweep**     | highlight band travels across the letters L→R | `--ease-surface` |
| `0.30–0.46`  | translateY          | `0` → `-40vh`                      | `--ease-emerge` |
| `0.30–0.46`  | opacity             | `1` → `0`                          | `--ease-emerge` |
| `0.30–0.46`  | scale               | `1.00` → `0.96`                    | `--ease-emerge` |

- **Gleam technique (recommended):** fill the lockup in `--gold`, overlay a moving `--gold-light`
  highlight band — a `linear-gradient` with a bright stripe — and animate its position across
  the text by local `t` (use `background-clip: text` on a gradient, or a masked pseudo-element).
  It should read as light catching metal at the waterline: subtle, single pass, ~0.6–0.8s worth
  of scroll. **Fallback:** if a text gleam isn't feasible, briefly lift brightness/`--gold` →
  `--gold-light` and back across `0.18–0.30`, then proceed with the drift. Never skip the drift.
- After the gleam, the lockup rises and dissolves like an ascending bubble as the mission takes
  over. Get this transition smooth — it's the moment the page is remembered by.

### 4.6 Mission — sentence 1 (lead)
- **Sub-window:** `0.58–0.74`. `localT` eased with `--ease-emerge`.
| Property    | From → To           |
|-------------|---------------------|
| opacity     | `0` → `1`           |
| translateY  | `28px` → `0`        |
| blur        | `8px` → `0`         |
- Resting center ≈ `46–50vh`. Set in the larger "lead" size; the gold emphasis phrase
  (`special situations`) animates in with its line.

### 4.7 Mission — sentence 2 (body)
- **Sub-window:** `0.66–0.84` (starts after sentence 1). If it wraps to multiple lines, you may
  **stagger** by `+0.03 p` per line. `localT` eased with `--ease-emerge`.
| Property    | From → To           |
|-------------|---------------------|
| opacity     | `0` → `1`           |
| translateY  | `20px` → `0`        |
| blur        | `6px` → `0`         |
- Gold emphasis phrases (`downside protection built at entry`, `ahead of the broader market`)
  reveal with the body — same ivory→visible motion, just colored gold.

### 4.8 Gold light shafts
| `p`   | opacity | notes                                   |
|-------|---------|-----------------------------------------|
| 0.18  | 0.0     | begin as we approach the surface        |
| 0.32  | 0.18    | full (subtle), just below surface       |
| 0.62  | 0.12    | thinning                                |
| 0.90  | 0.06    | faint in the deep                       |
- Tinted `--gold-light`. Plus an **ambient** time-based horizontal drift, ~`14s`, small
  amplitude, `--ease-drift` (independent of scroll). Keep subtle — gold light, not a spotlight.

### 4.9 Marine motes (particles)
- Appear at `p > 0.32`; density ramps to full by `p ≈ 0.55`. Opacity `0.06–0.12`, pale gold.
- Continuous time-based slow downward drift; 2 parallax depths. Below water only. Mobile:
  reduce count or omit.

### 4.10 Scroll cue (gold)
- Visible `p < 0.06`; fades to `0` by `p = 0.08`.
- **Ambient loop** (time-based): translateY `0 → 6px` and back, `1.6s`, `ease-in-out`,
  `alternate infinite`, with a gentle opacity pulse `0.5 ↔ 1`. In `--gold`.

### 4.11 Footer label (optional)
- **Sub-window:** `0.90–1.00`, eased `--ease-emerge`. opacity `0 → 1`, translateY `12px → 0`.
- Optional gold hairline rule above it fades in over the same window.

### 4.12 Vignette
- Opacity scales with `p` near-linearly, `0.0 → ~0.5` by `p = 1.0`, deepening the edges in the
  navy abyss.

---

## 5. Parallax summary (depth ordering)

From "nearest the camera" (moves most) to "farthest" (moves least):

```
near motes (1.15×)  >  marine motes far (0.9×)  >  iceberg mass (0.7×)  >  gold shafts (0.5×)  >  background gradient (0×, color only)
```

Keep multipliers gentle — parallax should read as *depth*, not obvious layer-sliding.

---

## 6. Non-scroll (time-based) animation

### 6.1 Page load-in (calm, ~1.5s total)
| Element          | Property             | From → To        | Dur   | Delay  | Easing          |
|------------------|----------------------|------------------|-------|--------|-----------------|
| Background/scene | opacity              | `0` → `1`        | 600ms | 0      | ease-out        |
| Gold lockup      | opacity + translateY | `0,16px` → `1,0` | 900ms | 150ms  | `--ease-emerge` |
| Scroll cue       | opacity              | `0` → `1`        | 500ms | 1200ms | ease-out        |
- No loud intro. The page arrives composed and quiet — the brand card, settling.

### 6.2 Ambient loops (subtle, always running below surface)
- Gold-shaft drift: ~`14s` cycle.
- Marine motes: per-particle `20–40s` falls.
- Optional iceberg "bob": translateY `±4px`, `8s` sine — *very* subtle; omit if it competes.

### 6.3 Hover (footer link only)
- color/opacity transition `200ms ease`. Focus ring appears instantly.

---

## 7. Performance rules (non-negotiable)

- **Animate only `transform` and `opacity`.** Never animate layout props (top/left/width/
  height/margin) on scroll.
- **Blur is expensive:** limit `filter: blur()` to the mission reveals (short windows) and
  small elements. On low-end/mobile, fall back to **opacity + translateY only** (drop blur).
- **One rAF loop:** read the smooth-scroll value once per frame, compute `p`, set a single CSS
  var `--p` and/or apply the handful of transforms. No heavy per-element scroll listeners.
- `will-change: transform, opacity` on the few animated layers; remove when idle.
- **Particles:** cap count; cap `devicePixelRatio` (≤ 2) for the canvas; reduce on mobile.
  Avoid full-screen blurred elements.
- Target **60fps** on a normal laptop; no layout thrash, no jank at the threshold or gleam.

---

## 8. Reduced motion (`prefers-reduced-motion: reduce`)

Provide a calm, equivalent experience — same content, no vestibular triggers:

- **Disable** smooth-scroll scrubbing, the camera descent, parallax, drift, the gleam sweep,
  blur, and motes.
- The page becomes a **simple, naturally-scrolling** layout: brand surface (navy + gold lockup)
  → mission statement, with elements fading in gently via `IntersectionObserver` (opacity only,
  short, ease-out). No large translation, no scale, no clip reveals.
- The gold waterline and lockup are presented statically (the lockup is simply gold on navy; no
  gleam). Gold light shafts may remain as a **static**, low-opacity element (no motion).
- The mission text (ivory body, gold emphasis) and footer are reachable and legible without
  any motion.

---

## 9. Implementation reference (pattern, not prescription)

A minimal vanilla sketch of the sticky-stage + progress + navy color-lerp + a discrete reveal.
Adapt freely; the **values above are what's binding**, not this code.

```js
import Lenis from 'lenis';
const lenis = new Lenis({ lerp: 0.09 });
const track = document.querySelector('.scroll-track');
const stage = document.querySelector('.stage');

// background stops from DESIGN_SYSTEM.md §2.1  -> [p, topRGB, bottomRGB]  (navy descent)
const STOPS = [
  [0.00, [ 31, 43, 72], [ 27, 38, 65]],  // #1F2B48 / #1B2641  brand surface
  [0.25, [ 26, 36, 64], [ 22, 31, 55]],  // #1A2440 / #161F37  waterline
  [0.45, [ 20, 28, 50], [ 16, 24, 44]],  // #141C32 / #10182C
  [0.70, [ 13, 20, 38], [ 10, 16, 32]],  // #0D1426 / #0A1020  deep
  [1.00, [  8, 14, 28], [  6, 10, 22]],  // #080E1C / #060A16  abyss
];
const lerp = (a,b,t) => a + (b - a) * t;
const lerpRGB = (a,b,t) => a.map((v,i)=>Math.round(lerp(v,b[i],t)));
const easeEmerge = t => 1 - Math.pow(1 - t, 3);     // expo-ish out for discrete reveals
const clamp01 = t => Math.min(1, Math.max(0, t));
const sub = (p,s,e) => clamp01((p - s) / (e - s));

function bgAt(p){
  for (let i=0;i<STOPS.length-1;i++){
    const [p0,t0,b0]=STOPS[i], [p1,t1,b1]=STOPS[i+1];
    if (p<=p1){ const t=(p-p0)/(p1-p0);
      return [lerpRGB(t0,t1,t), lerpRGB(b0,b1,t)]; }
  }
  return [STOPS.at(-1)[1], STOPS.at(-1)[2]];
}

function frame(){
  const rect = track.getBoundingClientRect();
  const total = track.offsetHeight - window.innerHeight;
  const p = clamp01(-rect.top / total);            // 0 → 1 across the track
  stage.style.setProperty('--p', p);

  const [top, bot] = bgAt(p);
  stage.style.background =
    `linear-gradient(180deg, rgb(${top}) 0%, rgb(${bot}) 100%)`;

  // signature gleam: move a highlight across the gold lockup over p 0.18–0.30
  const gleam = sub(p, 0.18, 0.30);                 // 0→1 sweep position
  wordmark.style.setProperty('--gleam', gleam);     // CSS uses it to position the highlight

  // wordmark drift-out over p 0.30–0.46
  const out = easeEmerge(sub(p, 0.30, 0.46));
  wordmark.style.opacity = 1 - out;
  wordmark.style.transform = `translateY(${out * -40}vh) scale(${1 - out*0.04})`;

  // mission sentence 1 over p 0.58–0.74
  const s1 = easeEmerge(sub(p, 0.58, 0.74));
  missionLead.style.opacity = s1;
  missionLead.style.transform = `translateY(${(1-s1)*28}px)`;
  missionLead.style.filter = `blur(${(1-s1)*8}px)`;

  // ...mass/tip transforms, gold waterline, shafts, vignette per §4
}
lenis.on('scroll', frame);
requestAnimationFrame(function raf(t){ lenis.raf(t); frame(); requestAnimationFrame(raf); });
```

> GSAP equivalent: one `ScrollTrigger` (`pin:true, scrub:true`) whose timeline 0→1 maps to `p`;
> place each element's tween at the `p` sub-windows in §4. Either approach must honor §7
> (transform/opacity only) and §8 (reduced motion).

[Lenis]: https://github.com/darkroomengineering/lenis
