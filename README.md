# Iceberg Partners LLC — Landing Page Brief

> **Read this file first, then `DESIGN_SYSTEM.md` and `ANIMATION_SPEC.md`.**
> This is the master brief. The other two files are the binding reference for visual
> tokens and motion choreography respectively. Where this file describes *intent*, those
> files describe *exact values*. If anything conflicts, the more specific file wins.

---

## 0. The one-paragraph version

Iceberg Partners LLC is a New York real estate **investment** firm. The site is a single,
minimal, scroll-driven page in the firm's identity: a **deep navy field with a gold
wordmark** — the same lockup as their card. On load, the visitor sees that brand surface:
the navy field, the small **tip** of an iceberg, and the **ICEBERG PARTNERS LLC** lockup in
gold, centered. As they scroll, the camera **descends through the waterline** — a thin gold
line passes, the gold of the wordmark catches one last gleam — and the enormous submerged
mass is revealed in deeper navy, and with it the mission statement. The metaphor and the
brand line up exactly: **gold is the polished, visible surface (the name); the depth below
is the substance** (the firm's actual work). Quiet, institutional, premium — never flashy.

---

## 1. Company context & brand (CONFIRMED)

- **Name (use in full):** **Iceberg Partners LLC**. The hero shows the lockup — `ICEBERG`
  large over `PARTNERS LLC` smaller and more tracked, both gold — matching the supplied
  logo. Use the firm's official logo asset where possible (see §10).
- **Location:** New York City.
- **What they do:** Real estate investment firm. Senior team, ~two decades across U.S.
  commercial real estate and Korean institutional capital. Special-situations / structured
  / control investing. This is a **serious institutional finance brand**, not a startup.
- **Confirmed brand colors:**

  | Role            | Value                                   | Notes                                            |
  |-----------------|-----------------------------------------|--------------------------------------------------|
  | **Navy (base)** | **PANTONE 2767 C** · screen ≈ `#1F2B48` | The brand field / background. Print = the Pantone. |
  | **Gold (mark)** | ≈ `#A99E69` (muted antique gold)        | Wordmark + the single precious accent.           |
  | Ivory (text)    | `#ECE7DA`                               | Mission text in the deep (readability on navy).  |

  > `#1F2B48` and `#A99E69` are screen samples from the brand artwork. Treat **PANTONE
  > 2767 C** as the source of truth for navy; confirm the official gold (likely a metallic
  > Pantone) against brand assets. Full token set in `DESIGN_SYSTEM.md` §2.

- **The brand idea:** an iceberg shows ~10% above water, ~90% below. The firm's value is the
  unseen depth — research, diligence, relationships, discipline. Every choice ladders back to
  **"depth beneath the surface."**

---

## 2. Reference & scope

- **Tonal reference:** `https://makarora-lp.com/` — near-empty, just a company name with an
  "about" reveal. We want that **same restraint and confidence**, but a **richer single
  interaction**: the scroll-driven descent below the waterline.
- **This is a one-page site.** No multi-page nav, no blog, no dashboard. The mission
  statement reveal is the entire experience. Resist scope creep (see §7).

---

## 3. The core experience — emotional arc

Design the page as a four-beat arc, not "show iceberg → scroll → show text." The arc is the
product:

1. **The brand surface (above water).** Stillness. The navy field with the gold lockup —
   the firm's recognizable face. The tip is *deliberately tiny* so the later reveal of the
   mass lands with contrast.
2. **The threshold (crossing the waterline).** The single most important moment. The camera
   passes *through* a thin **gold waterline**; the navy deepens; the gold lockup catches one
   specular gleam as if light hits metal at the surface. The hinge of the whole page.
3. **The revelation (the mass).** The submerged bulk scrolls into view in deeper navy, far
   larger than the tip, its facets traced in fine gold. The payoff: *this is what was under
   there the whole time.*
4. **Stillness (the deep).** Everything settles into deep, near-black navy. The mission
   statement rests here, ivory with gold emphasis. The page ends quiet — the calm of the
   opening, now with depth.

> **Signature moment:** the gold **ICEBERG PARTNERS LLC** lockup holds at the vertical center
> across the threshold; as the camera crosses the gold waterline, a soft **specular gleam
> sweeps across the gold letters** (light catching gold at the surface), then the lockup
> drifts upward and dissolves like a rising bubble as the mission emerges below. Gold — the
> polished, visible 10% — gives way to the navy depth, where the substance lives. This is the
> page's identity. Spend the design's boldness here; keep everything else quiet. (Exact
> timing in `ANIMATION_SPEC.md` §4.5.)

---

## 4. Mission statement (CONFIRMED — use verbatim)

> Iceberg Partners LLC is a real estate investment firm based in New York, led by senior
> professionals with two decades of experience across U.S. commercial real estate and Korean
> institutional capital. Iceberg seeks to provide differentiated capital solutions in special
> situations, with downside protection built at entry, spanning discounted note acquisitions,
> structured credit, and control investments sourced ahead of the broader market.

**Reveal structure.** Render as **real, selectable DOM text** (never image-only; present even
if JS fails). Split into **two staggered blocks** for the reveal — sentence 1 (who they are),
then sentence 2 (what they do) — matching the staggered animation in `ANIMATION_SPEC.md` §4.6–4.7.

**Gold emphasis (restrained).** This is dense, institutional prose — give it 2–3 visual
anchors by setting these short phrases in **gold** (`--gold`), nothing more:
`special situations` · `downside protection built at entry` · `ahead of the broader market`.
Body stays ivory for readability; gold is for emphasis only.

**Optional eyebrow.** A single small-caps line above the statement — e.g. `NEW YORK` or the
`ICEBERG PARTNERS LLC` mark at small size in gold — is allowed. Nothing else.

---

## 5. Page structure (DOM / layout model)

A single full-viewport "stage" pinned while a tall scroll track drives the animation:

```
<main>
  ├─ scroll-track            (tall, ~360vh — defines how much scrolling = full reveal)
  │   └─ stage               (position: sticky; top:0; height:100vh — the fixed viewport)
  │       ├─ layer: navy background gradient          (navy → deep navy, driven by scroll)
  │       ├─ layer: gold light shafts                 (faint, fade in near the surface)
  │       ├─ layer: iceberg — above-water tip         (small, tonal navy + gold rim)
  │       ├─ layer: gold waterline / surface          (thin gold line; passes off on descent)
  │       ├─ layer: iceberg — below-water mass        (large; tonal navy, gold facets)
  │       ├─ layer: marine motes                      (sparse pale-gold flecks, below surface)
  │       ├─ wordmark: ICEBERG PARTNERS LLC (gold)    (pinned center → gleam → drifts up/out)
  │       ├─ mission statement                        (ivory + gold emphasis, emerges in deep)
  │       ├─ scroll cue (gold)                        (only at the very top)
  │       └─ footer label (optional)                  (quiet, at the very bottom)
</main>
```

- Scrolling "down" reads as descending. Map scroll progress `p` (0 → 1) across the track and
  drive every animation from `p`. Per-layer behavior, easing, and keyframes are in
  **`ANIMATION_SPEC.md`** — follow it precisely.
- Keep the composition **centered and symmetric**: iceberg centered, lockup centered, mission
  centered within a constrained column.

---

## 6. The iceberg asset

- Build it as **layered inline SVG** (not raster), so tip / surface / mass transform
  independently. Particles (marine motes) may use a lightweight `<canvas>`.
- **Proportion carries the metaphor:** above-water tip ≈ **12–18%** of total iceberg height;
  submerged mass ≈ **82–88%**. Keep the tip genuinely small.
- **Rendered in brand, not literal white ice:** the iceberg is a **tonal navy form, slightly
  lighter than the background**, defined by **fine gold hairline facets** and a **gold rim at
  the waterline** — a dark, faceted mass drawn in gold light. Dramatic and unmistakably
  navy+gold. (If the client ever wants a more literal pale-ice look, lighten the ice tokens
  toward a cool off-white — but the recommended, on-brand direction is tonal navy + gold.)
- Exact tokens, faceting, and gradients: `DESIGN_SYSTEM.md` §2 + §6.

---

## 7. Non-goals / restraint (important)

Elegance here is subtraction. Do **not** add:

- ❌ A nav bar, menu, hamburger, or multiple pages/sections.
- ❌ Buttons/CTAs beyond (optionally) a single quiet contact label at the very bottom.
- ❌ Stock photography, 3D photoreal WebGL oceans, video backgrounds.
- ❌ A second accent color. **Gold is the only accent.** No teal, no cyan, no gradients-as-
  decoration, no glassmorphism, no "card" UI.
- ❌ Multiple competing animations at once. One orchestrated arc beats scattered effects.
- ❌ Loud copy, stacked taglines, or feature lists.

If a choice doesn't serve the four-beat arc in §3, cut it.

---

## 8. Definition of done

- [ ] On load: the navy brand surface, tiny tip, centered gold **ICEBERG PARTNERS LLC**
      lockup, subtle gold scroll cue. No jank.
- [ ] Scroll smoothly descends through the gold waterline (the threshold reads clearly),
      then reveals the large submerged mass in deeper navy.
- [ ] The lockup performs the signature gold **gleam** across the threshold, then drifts up
      and dissolves.
- [ ] The mission statement emerges in the deep with a staggered, eased reveal — ivory body,
      gold emphasis on the three phrases in §4 — fully legible.
- [ ] The page ends in deep, near-black navy. Calm.
- [ ] **Quality floor:** responsive to mobile; `prefers-reduced-motion` respected (see
      `ANIMATION_SPEC.md` §8); visible keyboard focus; mission text is real, selectable DOM
      and present without JS; WCAG AA contrast for all text (ivory body comfortably; verify
      gold emphasis against the live navy at its position).
- [ ] 60fps on a normal laptop (transform/opacity-driven; `ANIMATION_SPEC.md` §7).

---

## 9. Recommended stack (tool-agnostic values; pick what you're best at)

Tokens and motion values are framework-independent. Any of these is acceptable:

- **Vanilla (recommended for portability):** HTML + CSS + JS, [Lenis] for smooth scroll,
  inline SVG for the iceberg, a small `<canvas>` for motes. Sticky stage + scroll-progress
  variable (pattern in `ANIMATION_SPEC.md` §9).
- **GSAP:** ScrollTrigger with `pin: true` + `scrub: true`, mapping the phases to one
  timeline. Good if you prefer timeline authoring.
- **React:** Lenis + a `useScrollProgress` hook; optionally Framer Motion for the discrete
  text reveals; SVG components.

Whatever the stack: **animate only `transform` and `opacity`** (blur sparingly), keep the
palette navy + gold (gold is precious — use it sparingly), and let the gold gleam at the
waterline be the one thing the visitor remembers.

---

## 10. Brand assets

- **Use the official logo lockup** (`ICEBERG PARTNERS LLC`, gold) as a vector asset for the
  wordmark wherever possible, rather than re-typesetting it. If re-typesetting is unavoidable,
  match the classical serif direction in `DESIGN_SYSTEM.md` §3 (Trajan/Caslon-style; free
  analog: Cinzel).
- **Confirm the official gold** (the artwork samples to ≈ `#A99E69`; a metallic Pantone may be
  specified) and use the navy as **PANTONE 2767 C** for any print/handoff.

---

> **A note to the implementing AI:**
>
> Do not simply implement this specification literally. If you identify opportunities to
> improve the storytelling, animation timing, transitions, spacing, typography, or visual
> hierarchy while preserving the core concept, make thoughtful design decisions as a senior
> product designer would. Prioritize emotional impact, elegance, and restraint over adding
> more elements.

[Lenis]: https://github.com/darkroomengineering/lenis
