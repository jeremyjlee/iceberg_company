# Iceberg Partners LLC — Design System

> Binding reference for all visual tokens (as-built). Pair with `ANIMATION_SPEC.md` for motion.
> Read `README.md` first for intent. Values here are concrete on purpose — use them.

---

## 1. Design principles

1. **Depth beneath the surface.** Every choice ladders back to the iceberg metaphor: small/quiet
   above, vast/substantial below. The background literally travels from the brand navy at the
   surface to a near-black navy abyss as the visitor descends.
2. **Navy + gold, and nothing else.** A single deep-navy field (PANTONE 2767 C) with one precious
   **gold** accent. Gold appears rarely — the wordmark, the surface line (which becomes the
   iceberg rim), a few facet lines, the scroll cue, and the mission's emphasis — which is what
   makes it read as precious. No second accent.
3. **Restraint as luxury.** Generous negative space, slow pacing, minimal text. If an element
   doesn't serve the reveal, remove it. (We removed the above-water tip and the marine-mote
   particles for exactly this reason.)
4. **Precision over ornament.** A minimal, institutional direction lives or dies on spacing,
   type, and timing being *exact*. No sloppy rhythm, no arbitrary values.
5. **Classical, institutional voice.** A refined inscriptional serif (the logo's world) carries
   the personality — gravitas and heritage, the look of a serious finance firm.

---

## 2. Color system

A single vertical journey from the **brand navy surface** (top of scroll) to a **near-black navy
abyss** (bottom). Implemented as **five stacked gradient layers whose opacity is cross-faded** by
scroll progress `p` (compositor-only — no per-frame repaint; see `ANIMATION_SPEC.md` §4.1 / §7).
Gold, ice, and text are fixed tokens.

### 2.1 Background journey (by scroll progress `p`)

The layers and their gradient stops (top → bottom of viewport); layer *n* fades out across its
zone to reveal the next deeper layer beneath it:

| Layer | Zone (`p`)   | Top color   | Bottom color | Feel                              |
|-------|--------------|-------------|--------------|-----------------------------------|
| s0    | 0.00 → 0.25  | `#1F2B48`   | `#1B2641`    | the card: PANTONE 2767 C navy     |
| s1    | 0.25 → 0.45  | `#1A2440`   | `#161F37`    | the threshold                     |
| s2    | 0.45 → 0.70  | `#141C32`   | `#10182C`    | descending into navy              |
| s3    | 0.70 → 1.00  | `#0D1426`   | `#0A1020`    | deep, heavy                       |
| s4    | (base)       | `#080E1C`   | `#060A16`    | near-black navy abyss, always on  |

> Cross-fading adjacent layers approximates a smooth color travel while staying GPU-composited.
> A fine grain overlay (§5) prevents banding. Only discrete elements (text, the gleam) get eased
> reveals; the color travel tracks scroll near-linearly so it feels physically tied to it.

### 2.2 Fixed tokens

| Token                | Hex        | Use                                                       |
|----------------------|------------|-----------------------------------------------------------|
| `--navy`             | `#1F2B48`  | brand surface / base (PANTONE 2767 C, screen approx)      |
| `--navy-deep`        | `#0A1020`  | deep water                                                |
| `--navy-abyss`       | `#060A16`  | deepest background                                        |
| `--gold`             | `#A99E69`  | **wordmark + the single accent.** Surface line, facets, emphasis. |
| `--gold-light`       | `#CFC48C`  | specular gleam / highlight on dark, surface-line core     |
| `--gold-deep`        | `#7C7345`  | facet shadow / gold in depth                              |
| `--ice-surface`      | `#33405F`  | iceberg mass near the waterline (lighter navy)            |
| `--ice-mid`          | `#27324C`  | iceberg mid tone                                          |
| `--ice-deep`         | `#161E33`  | iceberg as it sinks toward the background                 |
| `--text-on-deep`     | `#ECE7DA`  | mission body — ivory/champagne (readability on navy)      |
| `--text-muted`       | `#9AA3BC`  | secondary text, labels, footer (muted slate)             |

> **Discipline:** gold is the *only* accent and appears in very few places. The iceberg is **navy
> drawn in gold light**, not a white object. (The SVG fills use literal hex sampled from these
> tokens; the easing/`--p` custom props live on the stage.)

### 2.3 Contrast guardrails

- Mission **body** (`--text-on-deep` on `--navy-deep`/`--navy-abyss`) → ≈ 12:1, AAA. Keep all
  long-form text ivory.
- **Gold** is the brand's wordmark color on navy (lower-contrast by nature). Use gold for the
  **large wordmark**, the **surface line**, and **short emphasis phrases** only — never for long
  body text. Verify each gold element meets **AA against the live background at its scroll
  position** (gold on the deep navy passes comfortably; gold on the lighter surface navy is
  AA-large only, matching the logo's own usage). *Outstanding: confirm the emphasis phrases at
  body size against the live navy.*
- If the mission ever sits over the iceberg mass, the mass is dimmed (opacity → ~0.18) by then,
  so ivory text stays clean; a soft radial darkening can be added if a busier region appears.

---

## 3. Typography

The logo is a classical inscriptional serif (Trajan/Caslon family). The type system follows that
world: a Roman-caps display face + a readable old-style text serif.

### 3.1 Typefaces (Google Fonts, loaded in `index.html`)

| Role             | In use                            | Final fallback     |
|------------------|-----------------------------------|--------------------|
| Wordmark / caps  | **Cinzel** (Trajan-like)          | Georgia, serif     |
| Mission lead     | **Cormorant Garamond** (display)  | Newsreader, serif  |
| Mission body     | **Newsreader** (text serif)       | Georgia, serif     |
| Labels (caps)    | **Cinzel** small / tracked        | Georgia, serif     |

- **Wordmark** = re-set in **Cinzel**, uppercase, gold (swap in the official logo vector when
  available — `README.md` §10).
- **Mission lead** (sentence 1) = **Cormorant Garamond**, light — the larger display sentence.
- **Mission body** (sentence 2) = **Newsreader** — refined text serif, legible at paragraph
  length. Ivory.
- **Labels** (scroll cue, footer, eyebrow) = Cinzel small caps, tracked. Muted slate or gold.

### 3.2 Type scale

| Element                 | Size                               | Weight | Tracking | Leading | Case      |
|-------------------------|------------------------------------|--------|----------|---------|-----------|
| Wordmark `ICEBERG`      | `clamp(2.25rem, 7vw, 6rem)`        | 500    | `0.08em` | 1.0     | UPPERCASE |
| Wordmark `PARTNERS LLC` | `clamp(0.76rem, 2.38vw, 2.04rem)`  | 500    | `0.18em` | 1.0     | UPPERCASE |
| Mission — eyebrow       | `0.8125rem` (13px)                 | 500    | `0.3em`  | —       | UPPERCASE |
| Mission — lead          | `clamp(1.5rem, 3.4vw, 2.6rem)`     | 300    | `0`      | 1.32    | Sentence  |
| Mission — body          | `clamp(1.0625rem, 1.55vw, 1.3rem)` | 400    | `0`      | 1.64    | Sentence  |
| Label / scroll cue      | `0.8125rem` (13px)                 | 500    | `0.3em`  | 1.4     | UPPERCASE |
| Footer label            | `0.75rem` (12px)                   | 500    | `0.2em`  | 1.4     | UPPERCASE |

- **Lockup proportion:** `ICEBERG` large over `PARTNERS LLC` smaller and more tracked (≈ 0.34×).
- **Mission column:** capped at `min(680px, 86vw)` with **no inner padding** (the grid centers
  the block; full measure keeps the lead to ~5 even lines).
- **Centered + balanced:** lead and body are `text-align: center` with **`text-wrap: balance`** so
  centered lines are even (no ragged "diamond"). The whole block is optically centered in the
  deep. Space between lead and body: `clamp(30px, 4.2vh, 56px)`.
- Enable kerning/ligatures on the serifs (`font-feature-settings: "kern","liga"`).

---

## 4. Spacing & layout

- **Base unit:** 8px. Scale: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192`.
- **Page side padding:** `--pad-side: clamp(1.5rem, 5vw, 6rem)` (used for stage edges, not inside
  the mission column).
- **Composition:** single centered column. Iceberg centered; lockup centered (rest at ≈ `-2vh`
  of viewport center); mission centered within its capped column. Vertical placement is
  scroll-driven (see `ANIMATION_SPEC.md`).
- **Rhythm:** spacious and breathing — a slow, quiet page.
- Everything optically centered and symmetric; no grid needed.

---

## 5. Atmosphere & texture

Subtle, low-opacity layers that sell "depth" without competing with the wordmark or text. Most
fade in only below the surface (timing in `ANIMATION_SPEC.md` §4.8).

- **Gold light shafts:** faint warm light descending from the surface. Peak opacity ~`0.18`
  (tinted `--gold-light`), thinning to ~`0.05` in the deep. Slow ambient horizontal drift
  (~14–18s). 3 shafts on desktop; the third is dropped and the blur lightened on mobile.
- **Surface-line gleam / rim:** the gold line itself is the atmosphere's main bright accent — see
  §6 and `ANIMATION_SPEC.md` §4.2. The wordmark **gleam** (§ANIMATION_SPEC 4.5) is the other.
- **Grain overlay:** fine film grain at ~`3.5%` (`mix-blend-mode: overlay`) to prevent gradient
  banding and add a tactile, premium quality. **Disabled on mobile** (the blend mode is costly).
- **Vignette:** gentle edge darkening that deepens with descent (opacity `0 → ~0.5`).
- **Removed:** the marine-mote canvas particles (the "drifting dots") are gone.

> If any atmosphere layer competes with the mission text or the iceberg, dial it down or cut it.

---

## 6. The iceberg (visual construction)

Rendered as a **refined, luminous crystal** — not flat poster-paint facets. The detail is built
from soft light + delicate gold lines on deep navy, kept restrained (luxury = light and line,
not busy fills).

- **Form:** inline SVG **mass** (`viewBox 0 0 560 700`), an irregular faceted silhouette — wide
  jagged shoulder just below the surface, widening then tapering to a deep point.
- **Body & light (defs gradients):**
  - `massBody` — a navy body gradient, lit upper-left (`#37456c`) → deep core (`#0b1121`).
  - `iceGlow` — a soft radial of light *entering the ice* from the upper-left surface (low opacity).
  - `iceDeep` — a vertical darkening toward the submerged point (the pressure of the deep).
  - The glow/deep overlays are **silhouette-shaped `<path>` fills** (no `clip-path` — a clipped
    layer re-rasterises on every scale step in Safari/mobile; this is the cheaper equivalent).
- **Lit facets (JS-generated, `#bergFacets`):** a low-poly mesh shaded by a **pseudo-3D light
  model** — the form bulges toward the viewer, so each facet catches or turns from the upper-left
  light → soft tonal navy planes (palette `ICE_LIGHT #7a8cb0` lit → `ICE_DEEP #0d1324`). Facets
  carry **no gold web** (same-colour hairline only, to close seams); the soft glow/deep overlays
  unify them into a luminous crystal.
- **Interior gold lines (JS-generated, `#bergEtch`):** only **a few deliberate ridges** — a
  central top→centre→bottom ridge plus two upper facet edges — drawn along the **actual mesh
  vertices** (`C` / `mids` / `OUT`) so they coincide exactly with the facets (never arbitrary).
- **One uniform gold outline.** The whole silhouette is a single gold line of **uniform weight**:
  the **top shoulder** is the morphing `#surfacePath`, the **sides + bottom** are `#bergOutline` —
  both drawn in the unscaled `#surface` SVG at the same `1.5px` non-scaling stroke / same gold
  gradient, so they read as one continuous contour (no faint mismatched rim). See
  `ANIMATION_SPEC.md` §4.2.
- **No above-water tip, no hard drop shadows, no flat cartoon facets.** Depth comes from the
  gradient light, the fine gold lines, the rising motion, and atmosphere.

---

## 7. Iconography & misc

- **Scroll cue:** a thin vertical gold line with a `13px` uppercase Cinzel `SCROLL` label. Gentle
  ambient bob on an inner element; the outer element's opacity is scroll-driven so it **reliably
  fades out on first scroll** (see `ANIMATION_SPEC.md` §4.10). Visible only at the very top.
- **Footer label:** one quiet line at the very bottom — currently `© 2026 · Iceberg Partners LLC`
  — in `--text-muted`, `12px`, tracked, with a faint gold hairline rule above. Fades in at the
  end. Nothing more.
- **No logo mark beyond the wordmark lockup.** The lockup *is* the identity.
- **No border-radius UI, no buttons, no cards.**

---

## 8. Accessibility & quality floor

- **Contrast:** meet WCAG **AA** for all text at every scroll position. Long body = ivory (high
  contrast). Gold = wordmark + surface line + short emphasis only.
- **Reduced motion:** honor `prefers-reduced-motion: reduce` — the scroll-scrubbed camera,
  parallax, drift, gleam, blur, and the iceberg/surface-line are disabled and replaced with a
  simple, naturally-scrolling layout that fades in via `IntersectionObserver`. Full spec in
  `ANIMATION_SPEC.md` §8.
- **Keyboard:** any interactive element (footer link) has a **visible focus ring** (`--gold`,
  2px, offset). Logical tab order.
- **No-JS / progressive enhancement:** the mission statement is real DOM text and readable if JS
  fails or is slow. Wordmark and mission are never image-only.
- **Motion comfort:** the descent is smooth, not lurchy. No sudden large jumps; no flashing.

---

## 9. Responsive

- **Mobile (≤ 640px):**
  - Iceberg mass widens to `78vw`; silhouette and proportion preserved.
  - Scroll track shortened to `~280vh` (vs `~360vh`) so the reveal isn't a marathon of swipes.
  - **Performance:** Lenis disabled (native scroll); mission-text **blur dropped**; **grain
    removed**; one light shaft dropped and shaft blur lightened; surface-line glow filter removed.
  - Mission column → `86vw`; sizes scale via clamp. Ivory body stays legible.
  - The four-beat arc stays intact — the surface-line → iceberg-rim morph still reads.
- **Large screens (≥ 1440px):** composition stays centered with the capped mission column; the
  navy field breathes — text never stretches full-width.
