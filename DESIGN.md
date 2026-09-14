# Anchor Home Services — Design System

**Physical Scene:** A homeowner in a sunlit kitchen at 9am, phone in one hand, looking for a clear answer about a leak or a cold house before calling. Later, a dispatcher glances at the board in a quiet, fluorescent-lit office. Light, breathable surfaces that read legibly in daylight with calm operational signals.

**Theme:** Light — porcelain working surfaces keep dense booking information breathable. Cobalt carries routing signal, not atmosphere.

**Color Strategy:** Committed — Anchor Cobalt (30–40% of surface as signal, rails, and actions) plus tinted mineral neutrals and porcelain base. Moss confirms, oxblood red is reserved for emergency only.

**Tokens (OKLCH-tinted, no pure #000/#fff):**
- `--porcelain` / `--background`: oklch(0.98 0.008  92) — #f7f8f6 slightly warm
- `--mist`: oklch(0.96 0.006 230) — #edf1f3 cool breath
- `--ink`: oklch(0.22 0.012 250) — #18222d
- `--ink-muted`: oklch(0.52 0.015 235) — #61707c
- `--line`: oklch(0.88 0.008 230) — #d7dfe4
- `--cobalt`: oklch(0.52 0.14 264) — #1957c2 (signal)
- `--cobalt-ink`: #1248a4 (hover)
- `--moss`: #4b6750 / #24542e (confirm)
- `--danger`: #9e3428 / #7d251c (emergency only)
- `--danger-soft`: #f8e8e6 / #fcf1ef
- `--footer`: #172c45 (deep ink)
- `--surface`: oklch(0.995 0.005 240) — tinted white for cards (use instead of #fff)

**Typography:**
- Display: Space Grotesk 500–700, tracking -0.055em, line-height 0.98, for h1–h3 and prices
- Body/UI: DM Sans 400–700, 9..40 optical size, for copy, controls, labels
- Hierarchy ratio ≥1.25 per step; body 45–75ch max; field labels 10px/800/.14em uppercase
- Prices: Space Grotesk 54px/700 for primary blocks

**Spacing Scale:** 4, 8, 12, 16, 20, 24, 28, 36, 48, 56, 72, 96, 116. Vary for rhythm; avoid uniform padding. Section blocks 116px vertical on desktop, 75px on mobile.

**Elevation:**
- Soft operational shadows, not soft blur blobs: 4–10px offsets with cobalt or ink at 8–18% opacity (e.g., `10px 10px 0 rgba(25,87,194,.16)`)
- Focus ring: 3px solid rgba(25,87,194,.48) offset 3px
- Header blur 16px with 94% porcelain translucency

**Radii:** 0px — square-cornered Field Manual tickets. Circular only for terminus dots, avatars, and check rings.

**Motion:**
- Duration 150–240ms; easing expo out — `cubic-bezier(.23,1,.32,1)` or `cubic-bezier(.16,1,.3,1)`
- No layout-property animation; use transform + opacity + color + border-color + box-shadow + background-color
- Entrance stagger 45–70ms; booking crossfade 180–240ms preserving visual location
- Respect `prefers-reduced-motion`

**Components:**
- Button: 48px min, 14px/700, Cobalt base, translate(-1px,-1px) + 4/5 shadow on hover, scale .97 on active
- Job Ticket: coded header strip, 1px line border, no radius, crossing-boundary optional
- Anchor Line: 1px cobalt with 7px circular terminus
- Dispatch Rail: vertical-rl, 9px/800/.14em
- Issue Card / Catalog Item: 1.5px line, hover to #f0f6ff→#eaf2ff, selected inset ring
- Coverage Checker, Scheduler, Help Box follow field manual card rules (full border or background tint, never side-stripe)

**Layout Paradigm:** Dispatch rail offset. Image fields stretch beyond content plane on desktop; on mobile rail collapses to horizontal status strip. Asymmetric intro splits and callouts, not centered marketing blocks.
