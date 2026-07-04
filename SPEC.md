# Trumpet — Component Spec

Every visible component, grouped by where it appears. For each: **Looks** (visual
description), **States** (default / hover / active / mobile), and **Content** (what goes
inside).

A note on mobile: Trumpet is a **desktop-first dashboard prototype**. There are no responsive
breakpoints — the layout assumes a wide viewport. The only adaptive behavior is the Revenue
donut's height-based compact mode. "Mobile" notes below say so honestly rather than inventing
breakpoints that don't exist; building responsive variants would be net-new design, not part
of the prototype.

---

## App Shell

The persistent frame around every page: fixed sidebar on the left, scrollable main column
(header + page content) on the right. Overlays (notification dropdown, notifications modal)
render above everything.

### Sidebar
- **Looks:** Fixed-width (232px) vertical rail on the app canvas. Top: brass-gold Trumpet
  logo mark + "Trumpet" wordmark. Below: a "Workspace" section label, then nav items; an
  "Account" section label, then the Settings nav item; pinned to the bottom, the account
  switcher trigger.
- **States:**
  - Nav item *default* (inactive): muted text, transparent background.
  - Nav item *hover*: surface lightens, text brightens.
  - Nav item *active*: brass-tinted background, gold text/icon — marks the current page.
  - Account trigger *default* vs *open*: open state highlights the trigger and shows the
    popover above it.
  - *Mobile:* no collapsed/hamburger variant — the rail stays fixed.
- **Content:** Logo + wordmark; Workspace nav (Overview, Music, Audience — each an icon +
  label); Account nav (Settings); account switcher trigger showing current account avatar,
  name, and a live "N live now" count with a pulsing dot.

### Account switcher popover
- **Looks:** Floating card anchored above the sidebar trigger, over a click-catching scrim.
  Header row + a list of account rows + divider + add/log-out actions.
- **States:** Open/closed (toggled by the trigger). Each account row: *current* (brass-tinted
  background + check icon) vs *selectable* (transparent, hover-highlight). "Add another
  account" only shows when an unused account exists.
- **Content:** "Accounts" label + total "N live now"; one row per active account (color
  avatar with initials, name, "N live · M monthly", check if current); "Add another account";
  "Log out".

### Header
- **Looks:** Top bar of the main column. Left: page title + subtitle. Center: search box.
  Right: notification bell + Export button.
- **States:**
  - Search box *empty* (placeholder) vs *typing* (shows a results dropdown over a scrim).
  - Bell *default* vs *open* (highlighted while the dropdown is shown); shows a small gold
    dot when there are unread notifications.
  - Export button hover.
  - *Mobile:* fixed three-part layout, no stacking.
- **Content:** Page title + subtitle (per page); search input ("Search releases, songs,
  albums…"); bell with unread dot; "Export" button with download icon.

### Header search results
- **Looks:** Dropdown below the search box listing matching releases; each row is icon +
  title/album + stream count.
- **States:** Shown only while the query is non-empty. *No-results* shows "No matches for
  '…'". Rows hover-highlight.
- **Content:** One row per matched catalog track (note icon, title, album, streams). Clicking
  jumps to that track on the Music page.

### Notification dropdown
- **Looks:** Floating panel anchored under the bell, over a scrim. Header + scrollable list +
  footer.
- **States:** Open/closed. Each row *unread* (faint brass background + trailing gold dot) vs
  *read* (transparent). "N new" pill hides when nothing is unread.
- **Content:** "Notifications" title + "N new" pill + "Mark all read"; rows (note icon, title,
  timestamp, body, unread dot); footer "See all notifications →" (opens the modal).

### Notifications modal
- **Looks:** Centered dialog over a full scrim. Header (title, total count, mark-all, close),
  toolbar (search + filter pills), scrollable list.
- **States:** Open/closed. Filter pills: *active* vs *inactive*. Search filters live. Empty
  state shows "No notifications match your search."
- **Content:** "All notifications" + total count; search input; filter pills (All, Insights,
  Milestones, Account); rows (icon, title, time, body, kind pill, unread dot).

---

## Overview Page

Vertical stack: pulse insight carousel, KPI ribbon, then a two-column chart row (streams
chart + revenue donut).

### Pulse insight carousel
- **Looks:** Wide banner card. Left: lightning-bolt icon. Middle: tag, a headline with one
  gold-highlighted phrase, and a sub line. Right: "View detail →" and pager dots.
- **States:** Auto-advances on a timer; *hover pauses* (and resumes on leave). Active pager
  dot is elongated and gold; others are short and grey. Body and "View detail" are clickable
  (navigate to the related page/selection).
- **Content:** Rotating insights — tag, pre/highlight/post headline, sub text, destination.

### KPI ribbon (Overview)
- **Looks:** Row of stat cards. Each: a top row with the label (and its optional "?" help icon
  inline, right after the label text) plus a muted metric glyph pinned to the top-right corner,
  then a big value and a delta row.
- **States:** Help icon *hover* reveals a tooltip (opens below, anchored to the icon's right so
  it stays in view). (Cards themselves are static.)
- **Content:** Per KPI — label, optional tip text, value, delta + "vs last month", and a
  corner icon (Streams → waveform, Listeners → headphones, Saves → heart, Followers → people,
  Save-to-Stream → percent).

### Streams chart
- **Looks:** Large card. Controls row: a metric segmented control (Streams / Listeners /
  Saves / Followers) on the left, a timeframe segmented control on the right — matching
  instruments. Below: big value + delta + "vs prior …" comparison label. Body: a slim
  left axis column whose labels are left-aligned flush with the card rail (controls,
  value, and scale share one left line), then the area+line chart with dashed gridlines.
  Average line with an "Avg" pill, hover crosshair + dot + tooltip, peak-event markers,
  a pulsing "now" dot on the last point; x-axis labels below the plot. The line draws in
  (fill fading with it) on metric/timeframe change.
- **States:**
  - Metric and timeframe segment items: *active* (gold pill) vs *inactive*; timeframe
    *hover* shows the full timeframe name as a tooltip.
  - Chart *hover*: crosshair + highlighted dot snap to the nearest data point; the tooltip
    (anchored to that point, flipping above/below to stay in view) shows period, value,
    and metric.
  - Peak-event *magnet*: when the cursor nears an event's x position, the crosshair tugs
    onto the event, the marker lights up (hover state), the plain dot hides, and the
    tooltip gains the event title + detail.
  - Delta color: green up / red down / grey flat ("lifetime" on All).
  - *Mobile:* fixed wide chart; not reflowed.
- **Content:** Metric tabs (label per metric), timeframe (1D/1W/1M/1Y/All), per-point
  series data with period labels, average, event markers (title + detail).

### Revenue donut
- **Looks:** Card with title/subtitle and an SVG donut; center shows a label + value; a legend
  lists each platform with color dot, name, %, and amount.
- **States:**
  - Segment/legend-row *hover*: that segment thickens, others dim; center swaps to the hovered
    platform's label + amount; a small tooltip appears. Legend row highlights.
  - *Compact (height < 470px):* legend is hidden, donut only. (The one real responsive rule.)
- **Content:** "Est. Revenue" + "Last 30 days · by platform"; segments per platform (label,
  %, amount, color); center total.

---

## Music Page

Main column with the movers widget on top and the catalog table below; a track-detail drawer
slides in from the right when a track is selected.

### Movers widget (Top performing tracks)
- **Looks:** Card with a title, sub line, and a timeframe segmented control; below, a grid of
  up to 4 mover cards. Each card: music icon, title, rank/timeframe sub, a sparkline, and a
  stream count.
- **States:** Timeframe tab *active* (gold) vs *inactive*. Mover card border turns gold when
  that track is the current selection; cards are clickable to open the drawer. Stream counts
  scale with the chosen timeframe.
- **Content:** "Top performing tracks" + sub; timeframe tabs (1D/1W/1M/1Y/All); top-4 tracks
  by streams (title, "#rank by streams · [phrase]", sparkline, streams).

### Catalog table
- **Looks:** Card with a toolbar (search field, "Filter" + format tabs, release count) and a
  sortable table. Columns: Track, Format, Released, Streams, Save Rate, Saves, Trend. Album/EP
  rows are expandable into a nested track listing.
- **States:**
  - Column header *click* toggles sort; the active column shows a gold ↑/↓ arrow, others a
    grey ↕.
  - Format filter tab *active* (gold fill) vs *inactive*.
  - Row *hover* highlights; *active/selected* row gets a brass background + a gold left active
    bar.
  - Expandable rows: *collapsed* (›) vs *expanded* (⌄), revealing a sub-table (sub-header +
    per-track rows). The current track within an expanded collection is gold + "This track"
    badge.
  - Search field in the toolbar is a static placeholder (display only).
  - *Mobile:* wide table scrolls horizontally; no column collapsing.
- **Content:** Toolbar (search placeholder, filter tabs: All/Single/Album/EP/Collabs, count);
  per release — icon, title, album, format pill (color dot), release date, streams, save rate,
  saves, trend pill (color dot). Expanded: "From the album/EP" + name + track count + "Open
  album breakdown"; sub-rows (number, icon, name, time, streams, save rate, saves, trend,
  chevron).

### Track detail drawer
- **Looks:** Right-side panel over a scrim. Header (label + Close). Body: track identity
  (icon, title, album·date, status pill); a streams card (total + growth vs prev 28 days); a
  3-stat row (Save Rate, Playlist Adds, Skip Rate); an "Engagement waveform" with colored
  skip/save bands, badges, and a time axis; a legend; a "Top markets" bar list. Footer: "Open
  full report" + "Export".
- **States:** Open when a track (row or sub-track) is selected; closes via scrim or Close.
  Growth value colored by sign. Waveform is deterministically generated per track (skip
  clusters red, save clusters green, plays grey). Footer buttons are decorative.
- **Content:** Track identity + status; total streams + growth; save rate / playlist adds /
  skip rate; waveform (skip band labeled "[skip] skipped here", save band "Chorus · [rate]
  saved"); legend (skip / save / plays); top markets (track market 42%, Germany 26%, UK 18%).

---

## Audience Page

A KPI ribbon across the top, then a two-column canvas: the listeners map (left) and a side
panel (right) holding the sources bento and gender split. Three overlays — KPI drawer, track
detail modal, city detail modal.

### KPI ribbon (Audience)
- **Looks:** Row of 4 stat cards.
- **States:** Each card is *clickable* (hover-highlights) to open the KPI drawer for that
  metric.
- **Content:** 4 audience KPIs (label, value, delta/sub).

### Listeners map
- **Looks:** Card containing a dotted world map (SVG dot grid) with circular country markers
  sized and opacity-scaled by listener count.
- **States:**
  - Marker *hover*: tooltip with country name + listeners.
  - Marker *selected*: gold ring around it; selecting a country re-scopes the side panel's
    data.
  - Background *click*: clears the selection (resets to worldwide).
  - *Mobile:* fixed-size map; not reflowed.
- **Content:** Dot-grid basemap; 10 country markers (name, listener count).

### Audience sources bento
- **Looks:** Panel with a header (current scope name + a Reset button) and two sub-sections:
  Top Tracks and Top Cities. Each is a ranked list with a show-more toggle.
- **States:** Reset button visible only when a region is selected. Each list toggles between
  truncated and full via show-more. Rows hover-highlight and are clickable to open detail
  modals. Data reacts to the selected map region.
- **Content:** Scope name; Top Tracks (rank, name, plays, chevron); Top Cities (rank, name,
  count, trend arrow ↑/▼, chevron).

### Gender split bento
- **Looks:** Card with a single segmented horizontal bar + a legend.
- **States:** Static — account-wide and location-independent (does not react to region).
- **Content:** Segments (≈60% Female, 39% Male, 1% Non-binary) with colors; legend (label +
  %).

### Audience KPI drawer
- **Looks:** Right-side drawer (~560px) over a scrim. Header label, large value, delta/sub,
  note paragraph; a 3-stat strip; a "By platform" section of progress-bar rows; footer with
  decorative "Open full report" + "Export".
- **States:** Open when a ribbon KPI is selected; closes via scrim. Footer buttons decorative.
- **Content:** Metric label/value/delta/note; New / Returning / Plays-per-listener; platform
  bars (Spotify, Apple Music, YouTube Music, Amazon/Other).

### Track detail modal (Audience)
- **Looks:** Centered modal (~430px) over a scrim. Header (#rank, title, plays, scope label);
  a 3-stat grid; a platform-split bar + legend.
- **States:** Open when a track row is clicked; closes via scrim. Stats/splits are
  deterministically seeded from the track name.
- **Content:** Rank, title, plays, scope; Saves / Avg. Completion % / Playlist Adds; platform
  split bar + legend.

### City detail modal (Audience)
- **Looks:** Centered modal (~430px) over a scrim. Header (#rank, city, listeners, trend %);
  platform-split bar + legend; a "Top Tracks Here" mini-list.
- **States:** Open when a city row is clicked; closes via scrim. Values seeded from the city
  name.
- **Content:** Rank, city, listeners, trend; platform split; top 3 region tracks (scaled).

---

## Settings Page

Two columns: a left nav rail and a content area (max 1060px) holding the artist profile and
preferences cards (top row) and the connected-platforms card below.

### Settings nav
- **Looks:** Vertical list of section links.
- **States:** *Active* item (Account) brass-tinted + gold; others muted with hover-highlight.
  (Nav items are display-only — they don't switch sub-views.)
- **Content:** Account, Notifications, Connected platforms, Billing.

### Artist profile card
- **Looks:** Card with a header (title + "Save changes" button), an identity row (round gold
  avatar with initials, name, meta, "Change" button), and a 2×2 grid of fields.
- **States:** "Save changes" and "Change" buttons hover; fields are display-only (selects show
  a ▾ caret but don't open). Decorative — no real persistence.
- **Content:** "Artist profile"; avatar "ET"; "Echo Theory" + "Verified artist · joined
  2021"; fields — Display Name (Echo Theory), Primary Genre (Indie Electronic ▾), Primary
  Market (United States ▾), Label (Independent).

### Preferences card
- **Looks:** Card titled "Preferences" with a list of rows, each a name + description and a
  toggle switch.
- **States:** Toggle *on* (gold track, knob right) vs *off* (grey track, knob left). Visual
  only — not interactive.
- **Content:** Weekly pulse email (on), Anomaly alerts (off), Milestone alerts (on), each with
  a description.

### Connected platforms card
- **Looks:** Card with a header (title + "4 of 6 connected — syncing every 15 min") and a 3×2
  grid of platform tiles. Each tile: brand-color dot in a square icon well, name, status with
  a status dot, and a "Connect" button for unconnected ones.
- **States:** Connected vs not-connected (status text + dot color differ; "Connect" button
  only on unconnected). "Connect" button hover. Decorative.
- **Content:** 6 platforms — Spotify, Apple Music, YouTube Music, Amazon Music (connected,
  "Connected · Nm ago"); TikTok, SoundCloud (not connected, "Connect").
