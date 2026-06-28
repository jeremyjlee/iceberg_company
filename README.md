# Iceberg Partners LLC — Landing Page

> **As-built documentation.** This file describes the site that is actually implemented and
> deployed; `DESIGN_SYSTEM.md` and `ANIMATION_SPEC.md` are the binding references for visual
> tokens and motion choreography respectively. Where this file describes *intent*, those files
> describe *exact values*. If anything conflicts, the more specific file wins.
>
> **Live:** https://jeremyjlee.github.io/iceberg_company/ · **Stack:** vanilla HTML + CSS + JS,
> [Lenis] smooth scroll (pointer devices only), inline SVG. Deployed via GitHub Pages from
> `main` (root). Every push to `main` redeploys.

---

## 0. The one-paragraph version

Iceberg Partners LLC is a New York real estate **investment** firm. The site is a single,
minimal, scroll-driven page in the firm's identity: a **deep navy field with a gold wordmark** —
the same lockup as their card. On load, the visitor sees that brand surface: the navy field, the
**ICEBERG PARTNERS LLC** lockup in gold (centered), and a single thin **straight gold waterline**
resting low on the screen. As they scroll, the camera **descends**: the navy deepens toward a
near-black abyss, the gold lockup catches one **specular gleam** and drifts up to dissolve, and
the **straight gold waterline morphs into the jagged top edge of an enormous submerged iceberg**
that rises from the deep — one continuous gold line going from *flat surface* to *iceberg rim*.
The mission statement then settles into the deep in ivory with gold emphasis. The metaphor and
the brand line up exactly: **gold is the polished, visible surface (the name, the waterline); the
depth below is the substance** (the firm's actual work). Quiet, institutional, premium.

---

## 1. Company context & brand (CONFIRMED)

- **Name (use in full):** **Iceberg Partners LLC**. The hero shows the lockup — `ICEBERG`
  large over `PARTNERS LLC` smaller and more tracked, both gold — matching the supplied logo.
  Currently re-typeset in **Cinzel** (see `DESIGN_SYSTEM.md` §3); swap in the official logo
  vector when available.
- **Location:** New York City.
- **What they do:** Real estate investment firm. Senior team, ~two decades across U.S.
  commercial real estate and Korean institutional capital. Special-situations / structured /
  control investing. A **serious institutional finance brand**, not a startup.
- **Confirmed brand colors:**

  | Role            | Value                                   | Notes                                            |
  |-----------------|-----------------------------------------|--------------------------------------------------|
  | **Navy (base)** | **PANTONE 2767 C** · screen ≈ `#1F2B48` | The brand field / background. Print = the Pantone. |
  | **Gold (mark)** | ≈ `#A99E69` (muted antique gold)        | Wordmark + the single precious accent.           |
  | Ivory (text)    | `#ECE7DA`                               | Mission text in the deep (readability on navy).  |

  > Full token set in `DESIGN_SYSTEM.md` §2. Treat **PANTONE 2767 C** as the source of truth for
  > navy; confirm the official gold against brand assets.

- **The brand idea:** an iceberg shows ~10% above water, ~90% below. The firm's value is the
  unseen depth — research, diligence, relationships, discipline. Every choice ladders back to
  **"depth beneath the surface."**

---

## 2. Reference & scope

- **Tonal reference:** `https://makarora-lp.com/` — near-empty, just a company name with an
  "about" reveal. We keep that **restraint and confidence**, with a **single richer interaction**:
  the scroll-driven descent in which the surface line becomes the iceberg.
- **This is a one-page site.** No multi-page nav, no blog, no dashboard. The mission-statement
  reveal is the entire experience. Resist scope creep (see §7).

---

## 3. The core experience — emotional arc

The page is a four-beat arc, not "show iceberg → scroll → show text." The arc is the product:

1. **The brand surface.** Stillness. The navy field with the gold lockup, centered — the firm's
   recognizable face. A single thin **straight gold waterline** rests low (just above a small
   scroll cue). Nothing above the water yet — the emptiness makes the later reveal land.
2. **The threshold.** As the descent begins, the navy deepens and the gold lockup catches one
   **specular gleam** (light hitting metal at the surface), then drifts upward and dissolves like
   a rising bubble.
3. **The revelation.** The straight gold waterline **morphs into the jagged top contour of a
   submerged iceberg** and rides it up as the enormous mass rises from the deep in deeper navy,
   its facets traced in fine gold. The payoff: *that calm line was the surface of this whole mass.*
4. **Stillness (the deep).** Everything settles into deep, near-black navy. The mission statement
   rests here, ivory with gold emphasis; the vignette deepens. The page ends quiet.

> **Signature.** Two linked golden moments carry the page: (a) the **gleam** sweeping across the
> gold lockup before it dissolves, and (b) the **single gold line** that begins as a flat
> waterline and becomes the iceberg's rim. Spend the design's boldness here; keep everything else
> quiet. (Exact timing in `ANIMATION_SPEC.md` §4.)

---

## 4. Mission statement (CONFIRMED — use verbatim)

> Iceberg Partners LLC is a real estate investment firm based in New York, led by senior
> professionals with two decades of experience across U.S. commercial real estate and Korean
> institutional capital. Iceberg seeks to provide differentiated capital solutions in special
> situations, with downside protection built at entry, spanning discounted note acquisitions,
> structured credit, and control investments sourced ahead of the broader market.

**Reveal structure.** Rendered as **real, selectable DOM text** (present even if JS fails). An
optional small-caps eyebrow (`NEW YORK`) sits above. Split into **two staggered blocks** — the
**lead** (sentence 1, who they are, in a larger display serif) and the **body** (sentence 2, what
they do) — each revealed with an eased fade + rise (timing in `ANIMATION_SPEC.md` §4.6–4.7). The
block is **optically centered** in the deep, set in a constrained column, with the lines balanced
(`text-wrap: balance`) and generous space between lead and body.

**Gold emphasis (restrained).** Three short phrases are set in **gold** (`--gold`), nothing more:
`special situations` · `downside protection built at entry` · `ahead of the broader market`.
Body stays ivory for readability; gold is for emphasis only.

---

## 5. Page structure (DOM / layout model)

A single full-viewport "stage" pinned (`position: sticky`) while a tall scroll track drives the
animation:

```
<main>
  └─ scroll-track            (tall, ~360vh desktop / ~280vh mobile)
      └─ stage               (position: sticky; top:0; height:100vh — the fixed viewport)
          ├─ bg               (5 stacked gradient layers, opacity cross-faded by scroll)
          ├─ shafts           (faint gold light shafts; fade in near the surface)
          ├─ iceberg mass     (below-water bulk: tonal navy, gold facets; rises on scroll)
          ├─ surface line     (SVG path: straight gold waterline → iceberg rim; rides the mass)
          ├─ wordmark         (ICEBERG PARTNERS LLC, gold — gleam → drifts up → dissolves)
          ├─ mission          (eyebrow + lead + body; ivory, gold emphasis; emerges in the deep)
          ├─ scroll cue       (gold; only at the very top, fades on first scroll)
          ├─ footer           (quiet label; fades in at the bottom)
          ├─ vignette         (edge darkening; deepens with descent)
          └─ grain            (fine film grain; disabled on mobile)
</main>
```

- Scrolling "down" reads as descending. A single normalized progress `p` (0 → 1) is computed
  from the track and drives every animation. Per-layer behavior, easing, and keyframes are in
  **`ANIMATION_SPEC.md`** — follow it precisely.
- Composition is **centered and symmetric**: iceberg centered, lockup centered, mission centered
  within a constrained column.
- **Removed vs. the original brief:** the separate above-water iceberg *tip* and the *marine
  mote* particles are gone — the start is intentionally emptier, and the gold line (not a
  separate rim) is now the iceberg's top edge.

---

## 6. The iceberg asset

- Built as **layered inline SVG** (not raster). One **mass** group (the submerged bulk) plus the
  separate **surface line** SVG that morphs into its rim.
- **Proportion carries the metaphor:** only the very top of the mass is visible at the waterline
  at the moment of crossing; the enormous bulk rises below. There is no longer a distinct
  above-water tip — the *line* is the surface, and it becomes the mass's top edge.
- **Rendered as a refined, luminous crystal — not flat poly:** a tonal navy body with soft light
  *entering the ice* (gradient glow), deepening to a near-black core, lit low-poly facets (no gold
  web), and **only a few deliberate gold ridge lines that sit exactly on the mesh edges**.
- **One uniform gold outline:** the whole silhouette is a single continuous gold line of even
  weight — the morphing line is the top, a matching `#bergOutline` draws the sides + bottom.
- Exact palette, gradients, facet light model, and the surface-line morph: `DESIGN_SYSTEM.md` §6 +
  `ANIMATION_SPEC.md` §4.2 / §4.4.

---

## 7. Non-goals / restraint (important)

Elegance here is subtraction. Do **not** add:

- ❌ A nav bar, menu, hamburger, or multiple pages/sections.
- ❌ Buttons/CTAs beyond (optionally) a single quiet contact label at the very bottom.
- ❌ Stock photography, 3D photoreal WebGL oceans, video backgrounds.
- ❌ A second accent color. **Gold is the only accent.** No teal, no cyan, no glassmorphism, no
  "card" UI.
- ❌ Multiple competing animations at once. One orchestrated arc beats scattered effects.
- ❌ Loud copy, stacked taglines, or feature lists.

If a choice doesn't serve the four-beat arc in §3, cut it.

---

## 8. Definition of done (current state)

- [x] On load: navy brand surface, centered gold **ICEBERG PARTNERS LLC** lockup, a straight
      gold waterline low on screen, and a subtle gold scroll cue. No tip, no jank.
- [x] Scroll smoothly deepens the navy and the lockup performs the gold **gleam**, then drifts up
      and dissolves.
- [x] The straight gold waterline **morphs into the iceberg's jagged rim** and rides the rising
      mass up — one continuous gold line, surface → iceberg top.
- [x] The mission statement emerges in the deep with a staggered, eased reveal — ivory body, gold
      emphasis on the three phrases in §4 — centered, balanced, fully legible.
- [x] The page ends in deep, near-black navy. Calm.
- [x] **Quality floor:** responsive to mobile; `prefers-reduced-motion` respected (see
      `ANIMATION_SPEC.md` §8); visible keyboard focus; mission text is real, selectable DOM and
      present without JS; WCAG AA contrast for body text. *(Outstanding: verify gold-emphasis
      contrast against the live navy at its scroll position; swap in the official logo vector.)*
- [x] Tuned for 60fps: transform/opacity-driven, background via opacity cross-fade (no per-frame
      repaint), blur/grain/Lenis reduced or disabled on touch (`ANIMATION_SPEC.md` §7).

---

## 9. Stack & deployment

- **Vanilla** HTML + CSS + JS. [Lenis] provides smooth scroll **on pointer devices only**
  (disabled on touch, where it fought native momentum); the visuals are driven by one `rAF` loop
  computing scroll-progress `p`. Inline SVG for the iceberg and the morphing surface line.
- **No build step.** Three source files: `index.html`, `styles.css`, `main.js`.
- **Deploy:** GitHub Pages, branch `main`, root. Pushing to `main` redeploys automatically
  (debounced — Pages builds the latest commit). Live at
  https://jeremyjlee.github.io/iceberg_company/.
- Whatever changes: **animate only `transform` and `opacity`** (blur sparingly, off on mobile),
  keep the palette **navy + gold** (gold is precious — use it sparingly), and let the gleam and
  the surface-line→rim morph be the things the visitor remembers.

---

## 10. Brand assets

- **Use the official logo lockup** (`ICEBERG PARTNERS LLC`, gold) as a vector asset for the
  wordmark wherever possible, rather than the current Cinzel re-typesetting (`DESIGN_SYSTEM.md`
  §3; free analog: Cinzel).
- **Confirm the official gold** (the artwork samples to ≈ `#A99E69`; a metallic Pantone may be
  specified) and use the navy as **PANTONE 2767 C** for any print/handoff.

[Lenis]: https://github.com/darkroomengineering/lenis
