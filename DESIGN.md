# SportStream — Design System

SportStream is a single-theme, dark sports-discovery interface. There is no light
theme. This document is the source of truth for the visual language; colors are
declared once as design tokens in `src/index.css` (`@theme` / `:root`) and used
throughout components as Tailwind theme utilities rather than arbitrary hex.

## Color tokens

Defined in `src/index.css` under `@theme`, which generates Tailwind utilities
such as `bg-surface`, `text-muted`, and `border-border`.

| Token | Value | Usage | Utility examples |
|---|---|---|---|
| `--color-pitch` | `#08090c` | App/page background, video surface | `bg-pitch` |
| `--color-surface` | `#111319` | Cards, sidebar, inputs | `bg-surface` |
| `--color-surface-elevated` | `#171a23` | Hover/inactive elevated surfaces | `bg-surface-elevated` |
| `--color-border` | `#1f2432` | Default borders and rings | `border-border`, `ring-border` |
| `--color-border-bright` | `#2e3547` | Hover borders, separators | `border-border-bright` |
| `--color-ink` | `#f1f5f9` | Primary text | `text-ink` |
| `--color-ink-inverse` | `#041a0e` | Text on accent buttons | `text-ink-inverse` |
| `--color-muted` | `#8892a4` | Secondary text, dates, tags, placeholders | `text-muted` |
| `--color-accent` | `#00f076` | Primary action, active state, focus ring | `bg-accent`, `text-accent` |
| `--color-accent-hover` | `#0df27e` | Accent hover state | `bg-accent-hover` |
| `--color-live` | `#ff2d55` | Live status text/dots on dark surfaces | `text-live`, `bg-live` |
| `--color-live-badge` | `#c81e44` | Live badge background behind white text | `bg-live-badge` |

### Contrast commitments (WCAG 2.1 AA, ≥ 4.5:1)

- `--color-muted` `#8892a4` → 5.5–6.4:1 on all dark surfaces; never use the
  old `#4a5568` (2.5–2.6:1, failing).
- White on `--color-live-badge` `#c81e44` → 5.6:1; white on `--color-live`
  `#ff2d55` is only 3.6:1 and is **not** permitted for text.
- `--color-ink`, `--color-accent`, amber and red status text used in the player
  all meet AA on the dark surfaces.

## Typography

- Font: **Outfit** (loaded from Google Fonts in `index.html`), with `system-ui`
  fallback. The old Inter-first stack is gone — Inter was never fetched.
- `--font-sans` is the single font token; `body` inherits it.
- Text sizes: content-bearing labels (badges, chips, timestamps, locale tags,
  "Available feeds", "Also live", nav captions) are **≥ 11px**. The prior
  `text-[10px]` / `text-[9px]` values failed the legibility floor.
- Type scale in use: 11px labels, `text-xs` (12px) metadata, `text-sm` body,
  `text-lg`/`text-xl` headings, `text-3xl`–`text-7xl` display titles.
- Uppercase tracking (`tracking-wider` / `tracking-[0.18em]`) is reserved for
  status badges and section labels.

## Layout & responsiveness

- Content max width `1800px`, with `px-4` → `sm:px-6` → `lg:px-10` gutters.
- Header is sticky (`h-14` mobile, `lg:h-[72px]`), with desktop category nav and
  a 7-column mobile category bar (Home, Football, Live, Upcoming, Basketball,
  Baseball, Others).
- Match grid: 1 → 2 → 3 → 4 → 5 columns (`sm`/`lg`/`xl`/`2xl`), using
  `content-visibility: auto` for long lists.
- Touch targets: ≥ 44px for search fields and category buttons
  (`min-h-12`/`min-h-14` mobile nav).
- Player: 16:9 video with a sticky info/feed sidebar (`lg:w-[340px]`,
  `xl:w-[380px]`) that stacks below the video on mobile.
- Safe-area padding is applied to the mobile category bar.

## Status & state semantics

- **Live** — red (`--color-live` text/dot, `--color-live-badge` chip), static dot
  plus a text label. One authoritative live badge appears in the player info
  block; feed cards use their own dot + `Live`/`Waiting` label.
- **Upcoming** — amber, text badge.
- **Focus** — global `:focus-visible` outline of 2px accent with 2px offset.
  Search inputs swap to an accent ring instead.
- **Loading** — single `LoadingSpinner` (Cardio) at a stable 96px, with
  `role="status"`. The 3× desktop scale and duplicate skeleton are removed.
- **Empty / error / stale** — icon + short explanation + retry action; stale
  data is kept behind a banner with an explicit "last updated" time.
- Copy always preserves the educational purpose and the third-party-source
  disclaimer (see `PRODUCT.md` / `README.md`). No ownership, "Premium", or
  "completely free" streaming claims.

## Motion

- Subtle, functional transitions only: color/border/background/box-shadow on
  interaction, plus small press/hover scales.
- Decorative pulsing dots and zero-offset neon glows were removed; status is
  communicated by color + label, not simulated animation.
- `prefers-reduced-motion: reduce` disables pulse/spin/loader animation and all
  transforms, keeping color, opacity, shadow and static dots as state feedback.
  It deliberately avoids a blanket `animation-duration: 0.01ms` so meaningful
  fades still work.

## Conventions

- Prefer theme utilities (`bg-surface`, `text-muted`, `border-border`) over
  `bg-[#111319]`-style arbitrary values. Add a token to `@theme` first if a new
  color is needed.
- Keep accessibility floors: AA contrast, ≥ 11px content text, ≥ 44px touch
  targets, visible focus, and real controls (no `href="#"` placeholders).
- No dead assets or scaffold code: only components and files that are actually
  imported ship in the build.
