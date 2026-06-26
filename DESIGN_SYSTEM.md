# Iceberg Partners LLC — Design System

> Binding reference for all visual tokens. Pair with `ANIMATION_SPEC.md` for motion.
> Read `README.md` first for intent. Values here are concrete on purpose — use them.

---

## 1. Design principles

1. **Depth beneath the surface.** Every choice ladders back to the iceberg metaphor: small/
   quiet above, vast/substantial below. The background literally travels from the brand navy
   at the surface to a near-black navy abyss as the visitor descends.
2. **Navy + gold, and nothing else.** A single deep-navy field (PANTONE 2767 C) with one
   precious **gold** accent. Gold appears rarely — the wordmark, the waterline, a few facet
   lines, the mission's emphasis — which is what makes it read as precious. No second accent.
3. **Restraint as luxury.** Generous negative space, slow pacing, minimal text. If an element
   doesn't serve the reveal, remove it. (Chanel rule: remove one accessory before you ship.)
4. **Precision over ornament.** A minimal, institutional direction lives or dies on spacing,
   type, and timing being *exact*. No sloppy rhythm, no arbitrary values.
5. **Classical, institutional voice.** A refined inscriptional serif (the logo's world)
   carries the personality — gravitas and heritage, the look of a serious finance firm.

---

## 2. Color system

A single vertical journey from the **brand navy surface** (top of scroll) to a **near-black
navy abyss** (bottom). Implement the background as an interpolation between these stops driven
by scroll progress `p` (see `ANIMATION_SPEC.md` §3 / §9). Gold, ice, and text are fixed tokens.

### 2.1 Background journey (by scroll progress `p`)

| `p`  | Zone               | Top color   | Bottom color | Feel                              |
|------|--------------------|-------------|--------------|-----------------------------------|
| 0.00 | Brand surface      | `#1F2B48`   | `#1B2641`    | the card: PANTONE 2767 C navy     |
| 0.25 | Waterline          | `#1A2440`   | `#161F37`    | the threshold; gold line passes   |
| 0.45 | Upper deep         | `#141C32`   | `#10182C`    | descending into navy              |
| 0.70 | Deep               | `#0D1426`   | `#0A1020`    | dim, heavy                        |
| 1.00 | Abyss              | `#080E1C`   | `#060A16`    | near-black navy, still            |

> Interpolate **in linear/sRGB** between adjacent stops. A fine grain overlay (§5) prevents
> banding. The *color* travel is near-linear so it feels physically tied to scroll — only
> discrete elements (text, the gleam) get eased reveals.

### 2.2 Fixed tokens

| Token                | Hex        | Use                                                       |
|----------------------|------------|-----------------------------------------------------------|
| `--navy`             | `#1F2B48`  | brand surface / base (PANTONE 2767 C, screen approx)      |
| `--navy-deep`        | `#0A1020`  | deep water                                                |
| `--navy-abyss`       | `#060A16`  | deepest background                                        |
| `--gold`             | `#A99E69`  | **wordmark + the single accent.** Waterline, facets, emphasis. |
| `--gold-light`       | `#CFC48C`  | specular gleam / highlight on dark                        |
| `--gold-deep`        | `#7C7345`  | facet shadow / gold in depth                              |
| `--ice-surface`      | `#33405F`  | iceberg mass near the waterline (lighter navy, catches light) |
| `--ice-mid`          | `#27324C`  | iceberg mid tone                                          |
| `--ice-deep`         | `#161E33`  | iceberg as it sinks toward the background                 |
| `--text-on-deep`     | `#ECE7DA`  | mission body — ivory/champagne (readability on navy)      |
| `--text-muted`       | `#9AA3BC`  | secondary text, labels, footer (muted slate)             |

> **Discipline:** gold is the *only* accent and appears in very few places (wordmark,
> waterline, a few facet hairlines, the scroll cue, and emphasis on three phrases). Do not
> spread it around. The iceberg is **navy drawn in gold light**, not a white object.

### 2.3 Contrast guardrails

- Mission **body** (`--text-on-deep` on `--navy-deep`/`--navy-abyss`) → ≈ 12:1, AAA. Keep all
  long-form text ivory.
- **Gold** is the brand's chosen wordmark color on navy (lower-contrast by nature, AA-large).
  Use gold for the **large wordmark** and **short emphasis phrases** only — never for long body
  text. Verify each gold element meets **AA against the live background at its scroll position**
  (gold on the deep navy passes comfortably; gold on the lighter surface navy is AA-large only,
  which matches the logo's own usage).
- If the mission ever sits over the iceberg mass or a busier region, add a **very soft radial
  darkening** behind the text (`--navy-abyss` at ~30–45%, large feather) so it reads as depth,
  not a box.

---

## 3. Typography

The logo is a classical inscriptional serif (Trajan/Caslon family). The type system follows
that world: a Roman-caps display face + a readable old-style text serif.

### 3.1 Typefaces

| Role             | Primary                         | Free fallback (use immediately)   | Final fallback     |
|------------------|---------------------------------|-----------------------------------|--------------------|
| Wordmark / caps  | The official logo asset (Trajan/Caslon) | **Cinzel** (Google; Trajan-like) | Georgia, serif     |
| Mission (body)   | Newsreader / Caslon             | **Newsreader** (Google)           | Georgia, serif     |
| Mission lead     | (optional display)              | **Cormorant Garamond** (Google)   | Newsreader, serif  |
| Labels (caps)    | Cinzel small / tracked          | **Cinzel** (Google)               | Georgia, serif     |

- **Wordmark** = the supplied lockup wherever possible. If re-set: **Cinzel**, uppercase, the
  classical inscriptional look of the logo. Gold.
- **Mission body** = **Newsreader** — a refined text serif that stays legible at paragraph
  length (the statement is dense institutional prose; readability matters). Ivory.
- **Mission lead / eyebrow** (optional) = Cormorant Garamond (lighter, more display) for a
  flourish; otherwise set the lead in Newsreader light. Keep the system to **logo-face +
  Newsreader** if you want maximum cohesion.
- **Labels** (scroll cue, footer) = Cinzel small caps, tracked. Muted slate or gold.

### 3.2 Type scale

| Element                 | Size                               | Weight | Tracking | Leading | Case      |
|-------------------------|------------------------------------|--------|----------|---------|-----------|
| Wordmark `ICEBERG`      | `clamp(2.25rem, 7vw, 6rem)`        | 500    | `0.08em` | 1.0     | UPPERCASE |
| Wordmark `PARTNERS LLC` | `~0.34×` the ICEBERG size          | 500    | `0.18em` | 1.0     | UPPERCASE |
| Mission — lead/sentence 1 | `clamp(1.5rem, 3.4vw, 2.6rem)`   | 300    | `0`      | 1.32    | Sentence  |
| Mission — sentence 2 / body | `clamp(1.0625rem, 1.55vw, 1.3rem)` | 400 | `0`      | 1.64    | Sentence  |
| Label / scroll cue      | `0.8125rem` (13px)                 | 500    | `0.18em` | 1.4     | UPPERCASE |
| Footer label (opt.)     | `0.75rem` (12px)                   | 500    | `0.2em`  | 1.4     | UPPERCASE |

- **Lockup proportion:** `ICEBERG` large over `PARTNERS LLC` smaller and more tracked — match
  the logo. Do not tighten the wordmark tracking.
- **Mission column width:** cap at `~62ch` / `min(680px, 86vw)`. Let sentence 1 breathe as the
  larger "lead"; sentence 2 is the calmer supporting block.
- Enable kerning/ligatures on the serifs (`font-feature-settings: "kern","liga"`). If using
  Cormorant for the lead, set a generous size; it's high-contrast and reads thin when small.

---

## 4. Spacing & layout

- **Base unit:** 8px. Scale: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192`.
- **Page side padding:** `clamp(1.5rem, 5vw, 6rem)`.
- **Composition:** single centered column. Iceberg centered; lockup centered; mission centered
  within its capped column. Vertical placement is scroll-driven (see `ANIMATION_SPEC.md`);
  resting centers sit around `46–50vh`.
- **Rhythm:** spacious and breathing — a slow, quiet page. Between mission sentence 1 and
  sentence 2: `clamp(20px, 2.5vh, 36px)`.
- No 12-column grid needed for a centered composition; keep everything optically centered and
  symmetric.

---

## 5. Atmosphere & texture

Subtle, low-opacity layers that sell "depth" without competing with the wordmark or text. Most
fade in only below the surface (timing in `ANIMATION_SPEC.md`).

- **Gold light shafts:** faint warm light descending from the surface — gold's natural home is
  "the light above." Peak opacity ~`0.18` (tinted with `--gold-light`), thinning to ~`0.06` in
  the deep. Slow ambient horizontal drift (~14s, small amplitude). 2–3 shafts max. Keep very
  subtle — gold light, not a spotlight.
- **Waterline gleam:** the brief specular sweep across the gold wordmark at the threshold (see
  `ANIMATION_SPEC.md` §4.5) — the atmosphere's one bright accent.
- **Marine motes:** sparse tiny **pale-gold** flecks drifting slowly downward, *below water
  only* (like dust in a shaft of light). Opacity `0.06–0.12`. 2 parallax depths. Low density —
  seasoning, not snow.
- **Grain overlay:** fine film grain at `2–4%` over everything. Prevents banding in the navy
  gradient and adds a tactile, premium quality. Static or very slow.
- **Vignette:** gentle edge darkening that deepens with descent — the pressure of the abyss at
  the bottom.

> If any atmosphere layer competes with the mission text or the iceberg, dial it down or cut it.

---

## 6. The iceberg (visual construction)

- **Form:** layered inline SVG. Three transformable groups: `tip` (above water), `surface`
  (the gold waterline element), `mass` (below water). Particles separate (canvas).
- **Silhouette:** irregular and faceted, not a smooth lozenge. The tip is a small jagged peak;
  the mass widens below the surface, then tapers to a deep point — the classic underwater bulk.
  Trace a few internal **facet lines in gold hairlines** (`--gold` / `--gold-deep`, ~1px, low
  opacity) for crystalline structure.
- **Proportion:** tip ≈ **12–18%** of total height; mass ≈ **82–88%**. Keep the tip small — the
  scale contrast at reveal is the point.
- **Fill (tonal navy):** the ice is a navy form, lighter than the background so it reads:
  - tip & just-below-surface: `--ice-surface` → `--ice-mid`
  - descending: `--ice-mid` → `--ice-deep`
  - deepest: `--ice-deep` blends toward the background (never a hard cutout)
- **Gold edge light:** a brighter **gold rim where ice meets the waterline** (the surface
  catching light), and gold hairline facets. This is what makes the dark mass read as ice. Use
  `--gold-light` for the brightest rim at the surface, fading to `--gold-deep` in depth.
- **No hard drop shadows.** Depth comes from the tonal gradient, gold facets, parallax, and
  atmosphere.

---

## 7. Iconography & misc

- **Scroll cue:** a thin vertical line or small chevron in `--gold`, with an optional `13px`
  uppercase Cinzel label (e.g. `SCROLL`). Gentle loop (see `ANIMATION_SPEC.md` §4.10). Visible
  only at the very top; fades on first scroll.
- **Footer label (optional):** one quiet line at the very bottom — e.g. `ICEBERG PARTNERS LLC ·
  NEW YORK`, or a single contact link — in `--text-muted`, `12px`, tracked. Optionally one gold
  hairline rule above it at low opacity. Nothing more.
- **No logo mark beyond the wordmark lockup.** The lockup *is* the identity.
- **No border-radius UI, no buttons, no cards.**

---

## 8. Accessibility & quality floor

- **Contrast:** meet WCAG **AA** for all text at every scroll position. Long body = ivory
  (high contrast). Gold = wordmark + short emphasis only; verify against the live navy at its
  position; use the soft radial darkening (§2.3) where needed.
- **Reduced motion:** honor `prefers-reduced-motion: reduce` — the scroll-scrubbed camera,
  parallax, drift, gleam, blur, and motes are disabled and replaced with simple fade-ins. Full
  spec in `ANIMATION_SPEC.md` §8.
- **Keyboard:** any interactive element (footer link) has a **visible focus ring** (`--gold`,
  2px, offset). Logical tab order.
- **No-JS / progressive enhancement:** the mission statement is real DOM text and readable if
  JS fails or is slow. Wordmark and mission are never image-only.
- **Motion comfort:** the descent must feel smooth, not lurchy. No sudden large jumps; no
  flashing. The threshold transition must not induce discomfort.

---

## 9. Responsive

- **Mobile (≤ 640px):**
  - Reduce iceberg facet detail; keep the silhouette and proportion.
  - Wordmark scales via the `clamp()` above; never crowd the edges (side padding holds).
  - Shorten the scroll track (~`280vh`) so the reveal isn't a marathon of swipes.
  - Reduce light-shaft and mote counts; consider dropping motes entirely.
  - Mission column → `86vw`; sizes scale via clamp. Keep ivory body legible.
  - Keep the four-beat arc intact — the gold waterline crossing must still read.
- **Large screens (≥ 1440px):** composition stays centered with the capped mission column; let
  the navy field breathe — do not stretch text full-width.
