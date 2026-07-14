# Trumpet — Design Reference

Every design value used in the prototype, extracted from the Trumpet design system tokens.
This is the source of truth for the look. When building or adjusting UI, pull from these
values rather than inventing new ones.

Aesthetic in one line: **gold-on-charcoal, flat, airy, calm** — one saturated hue (brass
gold) on deep charcoal, separated by color value not heavy shadow, with quick understated
motion (ease-out fades, never bouncy).

---

## Typography

**Typeface:** Space Grotesk — the single typeface for everything (headings, body, labels,
big stat figures). Geometric sans with strong tabular figures. Loaded from Google Fonts:
`Space+Grotesk:wght@300;400;500;600;700`.

```
--font-sans: "Space Grotesk", ui-sans-serif, system-ui, -apple-system,
             "Segoe UI", Helvetica, Arial, sans-serif;
--font-mono: var(--font-sans);   /* alias only — there is no monospace face */
```

Casing: Title Case for headings & labels, sentence case for body. **Not** all-lowercase.
Hierarchy is carried by weight; big figures (stream counts) are the hero element.

**Weights**
| Token            | Value |
|------------------|-------|
| `--fw-light`     | 300   |
| `--fw-regular`   | 400   |
| `--fw-medium`    | 500   |
| `--fw-semibold`  | 600   |
| `--fw-bold`      | 700   |

**Type scale (px)**
| Token          | Size | Use                       |
|----------------|------|---------------------------|
| `--fs-display` | 64px | hero figure (big stat)    |
| `--fs-stat`    | 40px | secondary stat            |
| `--fs-h1`      | 32px | page title                |
| `--fs-h2`      | 24px | section title             |
| `--fs-h3`      | 18px | card title                |
| `--fs-body`    | 15px | default body              |
| `--fs-sm`      | 13px | secondary / table cells   |
| `--fs-xs`      | 11px | labels, captions, eyebrows|

**Line heights**
| Token          | Value |
|----------------|-------|
| `--lh-tight`   | 1.05  |
| `--lh-snug`    | 1.25  |
| `--lh-normal`  | 1.5   |

**Letter spacing**
| Token          | Value    | Use                |
|----------------|----------|--------------------|
| `--ls-tight`   | -0.02em  | large figures      |
| `--ls-normal`  | 0        | default            |
| `--ls-wide`    | 0.04em   | small labels       |
| `--ls-caps`    | 0.12em   | uppercase eyebrows |

**Semantic text roles** (shorthand `font` values)
```
--text-display: 300 64px/1.05 Space Grotesk;
--text-stat:    400 40px/1.05 Space Grotesk;
--text-h1:      500 32px/1.25 Space Grotesk;
--text-h2:      500 24px/1.25 Space Grotesk;
--text-h3:      500 18px/1.25 Space Grotesk;
--text-body:    400 15px/1.5  Space Grotesk;
--text-label:   400 11px/1.5  Space Grotesk;
```

---

## Color

One saturated hue (brass gold) on deep charcoal. Greys tuned for legible contrast on dark.
Data viz leans on brass + cool greys, never a rainbow.

**Base palette**
| Token          | Hex      | Role                                   |
|----------------|----------|----------------------------------------|
| `--bg`         | #16171a  | app canvas — deep charcoal             |
| `--sub-alt`    | #1d1f23  | recessed/elevated surface (cards, wells)|
| `--sub-alt-2`  | #272a2f  | hover surface, subtle raise            |
| `--sub`        | #8f9299  | muted text & labels                    |
| `--sub-soft`   | #30333a  | faint borders, gridlines               |
| `--text`       | #f0ede5  | primary text — warm white              |
| `--text-dim`   | #bdbbb1  | secondary text                         |

**Accent (brass gold)**
| Token          | Hex      | Role                          |
|----------------|----------|-------------------------------|
| `--main`       | #e3b53a  | THE accent — brass gold       |
| `--main-hover` | #f2c860  | lighter brass on hover        |
| `--main-press` | #c29620  | deeper brass on press         |
| `--on-main`    | #1f1804  | text/icon on a brass fill     |

**State**
| Token           | Hex      | Role                         |
|-----------------|----------|------------------------------|
| `--error`       | #e5484d  | errors, negative deltas      |
| `--error-extra` | #7a2228  | error background tint        |
| `--success`     | #45c08a  | positive deltas (sparingly)  |

**Data-viz ramp** (brass-forward, restrained)
| Token        | Hex      | Role               |
|--------------|----------|--------------------|
| `--viz-1`    | #e3b53a  | primary series     |
| `--viz-2`    | #8a8d94  | secondary series   |
| `--viz-3`    | #bd911f  | tertiary series    |
| `--viz-grid` | #282b31  | chart gridlines    |

**Semantic aliases** (prefer these in product UI)
```
--surface-app:    #16171a   (--bg)
--surface-card:   #1d1f23   (--sub-alt)
--surface-raised: #272a2f   (--sub-alt-2)
--surface-inset:  #111214

--text-primary:   #f0ede5   (--text)
--text-secondary: #bdbbb1   (--text-dim)
--text-muted:     #8f9299   (--sub)
--text-on-accent: #1f1804   (--on-main)

--accent:         #e3b53a   (--main)
--accent-hover:   #f2c860   (--main-hover)
--accent-press:   #c29620   (--main-press)

--border-subtle:  #30333a   (--sub-soft)
--border-strong:  #45494f

--focus-ring:     #e3b53a
--caret:          #e3b53a
--positive:       #45c08a
--negative:       #e5484d
```

---

## Spacing, Sizing & Radius

8px base rhythm. Soft-but-present radii (never pill for containers, never sharp).
Generous breathing room.

**Spacing scale (base-8)**
| Token       | Value |
|-------------|-------|
| `--space-0` | 0     |
| `--space-1` | 4px   |
| `--space-2` | 8px   |
| `--space-3` | 12px  |
| `--space-4` | 16px  |
| `--space-5` | 24px  |
| `--space-6` | 32px  |
| `--space-7` | 48px  |
| `--space-8` | 64px  |
| `--space-9` | 96px  |

**Radii**
| Token           | Value | Use                    |
|-----------------|-------|------------------------|
| `--radius-sm`   | 6px   | chips, small controls  |
| `--radius-md`   | 8px   | buttons, inputs        |
| `--radius-lg`   | 12px  | cards, panels          |
| `--radius-xl`   | 16px  | large surfaces         |
| `--radius-full` | 999px | dots, avatars, toggles |

**Control heights**
| Token          | Value |
|----------------|-------|
| `--control-sm` | 32px  |
| `--control-md` | 40px  |
| `--control-lg` | 48px  |

**Layout**
| Token             | Value      |
|-------------------|------------|
| `--container-max` | 1280px     |
| `--sidebar-w`     | 232px      |
| `--gutter`        | 24px (--space-5) |
| `--border-width`  | 1px        |

---

## Effects — Shadow, Motion, Focus

The aesthetic is **flat**. Surfaces separate by color value, not shadow. Shadows are deep,
soft, and used only for true overlays (menus, dialogs, toasts). The accent gold never gets
a shadow.

**Shadows (overlays only)**
| Token         | Value                          |
|---------------|--------------------------------|
| `--shadow-sm` | 0 1px 2px rgba(0,0,0,0.25)     |
| `--shadow-md` | 0 6px 20px rgba(0,0,0,0.35)    |
| `--shadow-lg` | 0 16px 48px rgba(0,0,0,0.45)   |
| `--shadow-pop`| 0 8px 28px rgba(0,0,0,0.5)     |

**Focus ring (keyboard)**
```
--ring: 0 0 0 2px var(--bg), 0 0 0 4px var(--main);
```

**Motion** — quick and understated. Ease-out fades and tiny lifts, never bouncy.
Hover lightens the surface or accent; press deepens it.
| Token           | Value                              | Use            |
|-----------------|------------------------------------|----------------|
| `--dur-fast`    | 0.10s                              | snappy feedback|
| `--dur-base`    | 0.15s                              | default        |
| `--dur-slow`    | 0.25s                              | larger moves   |
| `--ease-out`    | cubic-bezier(0.22, 1, 0.36, 1)     | default easing (entrances) |
| `--ease-in`     | cubic-bezier(0.4, 0, 1, 1)         | exits — accelerate away |
| `--ease-in-out` | cubic-bezier(0.65, 0, 0.35, 1)     | symmetric moves|
| `--transition`  | 0.15s cubic-bezier(0.22,1,0.36,1)  | shorthand      |

**Glass / overlay scrim**
| Token     | Value                    |
|-----------|--------------------------|
| `--scrim` | rgba(20,21,22,0.6)       |
| `--blur`  | blur(6px)                |

---

## Notes

- Source of truth is the design-system token set, not hardcoded literals. A few prototype
  components use one-off literal values (e.g. some cards at `#2c2e31`) that sit between
  these tokens — when adding UI, snap to the nearest token above rather than copying drift.
- One hue only. If a new element needs emphasis, reach for weight, the brass accent, or a
  grey from the viz ramp — not a new color.
- Keep motion in the 0.10–0.25s range with `--ease-out`. No bounce, no spring.
