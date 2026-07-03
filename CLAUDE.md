Project: Trumpet

Companion docs (read these too):
- DESIGN.md — every design token (color, type, spacing, radius, motion). Pull values from
  here; don't invent new ones.
- SPEC.md — every visible component, with its looks, states, and content.

What this is: An interactive design prototype of a music analytics dashboard. It exists to
showcase the design — to demonstrate a clean, sleek, beautiful interface in a way that feels
real and clickable. That is the entire purpose.

What this is NOT: This is not, and will not become, a real product. There is no backend,
no API, no database, no auth, no real data pipeline — and none of these will ever be added.

IMPORTANT — do not build infrastructure:
- Never add a backend, server, API client, fetch/HTTP calls, database, ORM, auth, or
  environment config. Do not "prepare seams" for a future API. There is no future API.
- All data is mock data hardcoded in src/data/. Keep it that way. If a screen needs data,
  add it as a static mock — never wire up a real source.
- Don't spend effort on data fetching, loading/error states, caching, pagination logic,
  or anything that only matters for live data. It's a prototype; the data is fixed.
- When in doubt, choose the path that makes the design look good with the least machinery.

The only goal: make the design look and feel excellent.
- Pixel-level polish, clean spacing, consistent type and color, smooth restrained motion.
- Interactions exist to make the prototype feel alive (hover states, drawers, modals,
  selecting a region/track to reshape what's shown) — not to be production-correct.
- Optimize every decision for visual quality and a convincing, sleek demo. Nothing else.

Aesthetic: dark-mode analytics, charcoal surfaces (#2c2e31 cards on #1d1f23 base),
gold/amber accent (#e3b53a), warm off-white text (#f0ede5), muted gray secondary (#8f9299).
No light mode. Real CSS :hover states, restrained cinematic motion, no bounce.

Stack: Vite + React + TypeScript. Co-located CSS per component, BEM-style class names.
No CSS framework, no component library, no router — page switching is state-driven.

Architecture (intentionally minimal):
- State lives in a single React Context (src/context/AppContext.tsx): one state object + update().
- src/components/<area>/ — each screen plus its sub-components, each with co-located .css
- src/data/ — hardcoded mock datasets (this is the only data layer, by design)
- src/lib/ — pure presentational helpers (formatting, seeded deterministic generation for
  visuals like waveforms — purely cosmetic)
- src/types.ts — shared types

Screens: Overview, Music, Audience, Settings.
