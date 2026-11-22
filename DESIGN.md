# SportStream — Broadcast Score Bug design system

SportStream is a single-theme, dark, imagery-led sports interface. The visual
world is a broadcast score bug laid over real event artwork supplied by the
upstream APIs. There is no light theme. Tokens live once in `src/index.css`
(`@theme` / `:root`) and are consumed as Tailwind theme utilities.

This world replaced the earlier dark-card system and the metro-tile direction
recorded in the previous surface brief. The user pin that drove it: use the
images the APIs return for events.

## Colour tokens

| Token | Value | Role |
|---|---|---|
| `--color-pitch` | `#0b0d12` | Page ground, video well |
| `--color-surface` | `#11151d` | Panels, rails, ticker |
| `--color-surface-elevated` | `#171c26` | Hover and inactive fields |
| `--color-border` | `#262b36` | One-pixel seams |
| `--color-border-bright` | `#3a4150` | Hover seams, scrollbar thumb |
| `--color-ink` | `#f2f0e9` | Primary text and light plate |
| `--color-ink-inverse` | `#0b0d12` | Text on light plate and accent |
| `--color-muted` | `#9aa0a8` | Secondary text; ≥ 4.5:1 on every ground |
| `--color-accent` | `#f5c518` | Amber signal: clock, focus, primary action |
| `--color-accent-hover` | `#ffd84a` | Accent hover |
| `--color-signal` | `#c81e2b` | Live plates, lamps, large display only |
| `--color-live-badge` | `#c0271f` | White text on red: 5.6:1, used for small stamps |
| `--color-sky` | `#2b6cff` | Secondary signal accent |

Colour is functional. Small white-on-red text uses `bg-live-badge`, never
`bg-signal`; bright signal red is reserved for large plates, lamps and rules.
LIVE, WAITING and ENDED are stated in words, with a form/lamp difference as
well as hue.

## Typography

- Both faces are self-hosted as latin `woff2` in `public/fonts` — no external
  font request, so the installable build works offline.
- Display: **Barlow Condensed**, tracked tight, uppercase, fixed scale
  (`text-5xl`–`text-8xl` for headlines, `clamp()` for score-bug team names).
  Team plates use `leading-[0.82]` and collide at a red VS.
- Body: **Archivo** at 11–16px. Metadata uses `font-display` with
  `tracking-[0.16em]`–`tracking-[0.22em]` rather than tiny sans caps.
- No gradient text, no backdrop halo, no decorative tracking shifts.

## Layout and surfaces

- **Landing** (`/`): full-bleed featured event art with a score bug and two
  CTAs, a four-cell signal strip, a poster wall of six real API images, three
  numbered steps, plain-facts FAQ, and a closing CTA.
- **App** (`/app`): sticky rail with wordmark, search and seven sport tabs;
  full-bleed featured fixture over real artwork; live ticker; time-ranked
  fixture board with fixed columns (time, thumbnail, fixture, competition,
  feeds, status) and a time/status sort control.
- **Player** (`/watch/:id`): 16:9 well using the event poster behind the play
  gate, a compact score bug, and a sticky sidebar of stamped feed coupons.
  The iframe mounts only on play and keeps `allow="fullscreen; picture-in-picture"`.
- Responsive: phone bottom tab bar and a compact four-column board (time,
  thumbnail, fixture, status); the six-column board and seven-tab strip begin at
  the tablet breakpoint (768px), so the fixture title is never crushed between
  640–767px. Desktop keeps the full rail. Touch targets ≥ 44px at every width,
  including touch-capable desktops. On phones the player gate (score bug and
  play) sits in a flat field directly below the 16:9 well so the poster keeps its
  aspect ratio; from the tablet breakpoint up it overlays the well. Content max
  width 1800px.
- Flat fields with one-pixel seams. No rounded card stacks, no nested cards,
  no offset shadows, no glass decoration.

## Imagery provenance

Every event image is loaded from the upstream APIs: PPV poster URLs
(`static.ppvservices.st`), StreamFree thumbnails (`streamfree.top/thumbnails`)
and team crests (`a.espncdn.com`) exposed as `APIMatch.crests`. `EventArt`
walks `api.getPosterCandidates()` on error and ends at
`/sports_placeholder.png` only when an upstream image fails — artwork is
never invented or stock-sourced. Captures in `.impeccable/review/` are review
evidence, not shipping assets.

## Motion

The live strip is user-scrollable, not auto-animated: it sits in a masked,
touch-scrollable rail so the visitor controls the pace. There is one authored
arrival — the score bug wipes on like a broadcast lower-third (`scorebug__*` in
`src/index.css`): the status strip resolves, both plates reveal outward-in
toward the red VS, the VS stamps, then the clock settles. It runs once per
surface (landing, featured fixture, player), never per scrolled row. Supporting
motion is a short opacity cut when the sport category changes (`view-cut`) and
a crossfade of the player's poster veils into the stream with a faded-in
"Connecting…" state (`player-poster-veil`, `player-connecting`). Status is never
communicated by pulse alone; there are no loops, bounces, auto-scrolling or
hover lifts. Reduced motion removes every spatial arrival while keeping the
state and the words legible.

## Accessibility

AA contrast on all text, ≥ 11px content labels, ≥ 44px touch targets, visible
amber focus rings, themed caret, selection, scrollbar and underline offset.
Real buttons for every row, tab and feed; the featured match has both a visible
CTA and a keyboard/screen-reader activation button.

## Conventions

Prefer theme utilities over arbitrary hex. Add a token before a new colour.
Keep the educational disclaimer and the third-party-source boundary in all
public copy; no ownership, premium or "free stream" claims.
