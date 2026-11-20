---
name: Realtime chat
description: Internal team chat — a calm, well-lit workspace where only what needs you carries color.
colors:
  signal-green: "oklch(0.56 0.15 152)"
  signal-green-ink: "oklch(0.99 0.01 155)"
  signal-green-dark: "oklch(0.696 0.17 162.48)"
  signal-green-dark-ink: "oklch(0.393 0.095 152.535)"
  focus-green: "oklch(0.62 0.16 152)"
  bubble-own: "oklch(0.53 0.14 153)"
  bubble-own-dark: "oklch(0.42 0.1 158)"
  bubble-other: "oklch(0.955 0.004 286)"
  bubble-other-dark: "oklch(0.235 0.006 286)"
  online: "oklch(0.65 0.17 150)"
  mention-amber: "oklch(0.93 0.08 85)"
  mention-amber-ink: "oklch(0.35 0.08 60)"
  mention-amber-dark: "oklch(0.38 0.07 80)"
  alert-red: "oklch(0.577 0.245 27.325)"
  paper: "oklch(1 0 0)"
  ink: "oklch(0.141 0.005 285.823)"
  shelf: "oklch(0.975 0.003 286)"
  shelf-selected: "oklch(0.93 0.004 286)"
  mist: "oklch(0.967 0.001 286.375)"
  graphite: "oklch(0.552 0.016 285.938)"
  hairline: "oklch(0.92 0.004 286.32)"
  night: "oklch(0.141 0.005 285.823)"
  night-shelf: "oklch(0.17 0.005 286)"
  night-raised: "oklch(0.274 0.006 286.033)"
  night-graphite: "oklch(0.705 0.015 286.067)"
typography:
  display:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.33
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.43
  body:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.625
    fontFeature: "\"cv11\", \"ss01\""
  label:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.33
  meta:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: "\"tnum\""
  mono:
    fontFamily: "Geist Mono Variable, ui-monospace, monospace"
    fontSize: "0.85em"
    fontWeight: 400
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  bubble: "16px"
  full: "9999px"
spacing:
  hairline: "1px"
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  header: "56px"
  nav-width: "256px"
  members-width: "240px"
components:
  button-primary:
    backgroundColor: "{colors.signal-green}"
    textColor: "{colors.signal-green-ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "40px"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "40px"
  button-ghost:
    textColor: "{colors.graphite}"
    rounded: "{rounded.md}"
    size: "40px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "40px"
  bubble-own:
    backgroundColor: "{colors.bubble-own}"
    textColor: "{colors.signal-green-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.bubble}"
    padding: "8px 14px"
  bubble-other:
    backgroundColor: "{colors.bubble-other}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.bubble}"
    padding: "8px 14px"
  nav-item:
    textColor: "{colors.graphite}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 8px"
    height: "32px"
  nav-item-active:
    backgroundColor: "{colors.shelf-selected}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "32px"
  unread-badge:
    backgroundColor: "{colors.signal-green}"
    textColor: "{colors.signal-green-ink}"
    rounded: "{rounded.full}"
    padding: "0 6px"
    height: "16px"
  composer:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.xl}"
    padding: "6px"
---

# Design System: Realtime chat

## Overview

**Creative North Star: "The Well-Lit Office"**

Realtime chat is a workplace you spend the whole day in, so it is built like a good office: evenly lit, orderly, nothing competing for your eye until something genuinely needs you. Surfaces are quiet neutrals with the faintest violet-gray cast; structure comes from hairline borders and two or three tonal steps, not from boxes, shadows or color. The interface should disappear while you read and reappear, precisely, when you act.

Color is a signal, not decoration. One green — Signal Green, the color of "online" and "new" — marks what is yours or what is waiting: your own messages, the unread count, the active channel's mark, the primary action. Amber is reserved for the one thing more urgent than "new": someone called you by name. Everything else is ink on paper. Dark mode is the same office at night: the same hierarchy, lower luminance, never a different personality.

Density is moderate and work-grade. Lists are tight (32px rows on desktop), conversation text is relaxed (1.625 line height) because it is read continuously, and the layout behaves like a tool: fixed header, fixed navigation, only the conversation scrolls.

**Key Characteristics:**
- Quiet neutral surfaces; depth by tone and hairlines, shadows only on things that float.
- A single functional accent (Signal Green) plus amber for mentions and red for destruction.
- One typeface (Geist) carrying every role through size and weight.
- Restrained, precise components: flat at rest, crisp focus, short ease-out motion.
- Equal care for light and dark, desktop and phone.

## Colors

A near-achromatic office palette with one functional green, one attention amber and one alarm red. All values are OKLCH and live as CSS custom properties in `src/index.css`, redefined under `.dark`.

### Primary
- **Signal Green** (`signal-green`): primary buttons, unread badges, the active channel's `#`, links, the reply marker in the composer, selection tint and the text caret. Deep enough (L 0.56) that white text on it passes AA. In dark mode it becomes `signal-green-dark` with dark ink on top.
- **Own Bubble Green** (`bubble-own` / `bubble-own-dark`): a half-step deeper than Signal Green so long runs of your own messages read as calm, not loud.
- **Focus Green** (`focus-green`): focus rings and the composer's focus border, usually at 20% for the soft ring and full strength for the border.

### Secondary
- **Mention Amber** (`mention-amber`, ink `mention-amber-ink`, dark `mention-amber-dark`): mention chips that name you, the background tint (40%) of a message that mentions you, search-hit highlights, and the jump-to-message flash (`--highlight`).

### Tertiary
- **Alert Red** (`alert-red`): destructive actions, the "Novas mensagens" divider, error text and danger-zone borders (at 40%).
- **Online** (`online`): presence dots only.

### Neutral
- **Paper** (`paper`): the main canvas, inputs, the composer, popovers.
- **Ink** (`ink`): primary text and headings.
- **Shelf** (`shelf`): the navigation column — one step off Paper so the workspace reads as two zones without a border carrying the weight.
- **Shelf Selected** (`shelf-selected`): the active nav row.
- **Mist** (`mist`): muted fills — skeletons, empty-state icon discs, segmented-control track, hover rows.
- **Graphite** (`graphite`): secondary text, metadata, idle nav items, idle icons.
- **Hairline** (`hairline`): every border and divider.
- **Bubble Other** (`bubble-other` / `bubble-other-dark`): other people's messages.
- **Night / Night Shelf / Night Raised / Night Graphite**: the dark-mode counterparts of Paper, Shelf, Mist and Graphite; dark borders are white at 10%.

### Named Rules
**The Signal Rule.** Green means "yours" or "waiting for you" — never decoration. If an element is green, the user must be able to say which of those two it is.

**The One Alarm Rule.** Amber is only for being addressed by name; red is only for destruction and "you missed something". Neither appears as a general accent.

**The Tinted Overlay Rule.** Secondary text on a colored surface (own bubble, mention row) is the surface's own foreground at reduced opacity, never a gray.

## Typography

**Display Font:** Geist Variable (with ui-sans-serif, system-ui)
**Body Font:** Geist Variable
**Label/Mono Font:** Geist Mono Variable for code spans and code blocks inside messages only

**Character:** One neutral grotesk across every role, with stylistic alternates `cv11` and `ss01` on. Hierarchy comes from weight (400 / 500 / 600) and a small, deliberate size scale, not from a second face.

### Hierarchy
- **Display** (600, 1.875rem, 1.2, -0.025em): the auth side-panel statement only.
- **Headline** (600, 1.5rem, 1.33, -0.025em): page titles — "Entrar", "Meu perfil", "Gerenciar canais", the channel title in admin.
- **Title** (600, 0.875rem): channel header name, settings section headings, dialog-level emphasis inside lists.
- **Body** (400, 0.875rem, 1.625): message text and all form/list content. Message bubbles cap at min(36rem, 82%) so lines stay readable.
- **Label** (500, 0.75rem): sender names, nav section labels ("Canais", "Mensagens diretas"), day dividers, keyboard hints.
- **Meta** (400, 0.6875rem, tabular figures): timestamps and "editada" inside bubbles, at 70% opacity of the bubble's own text color.

### Named Rules
**The No Eyebrow Rule.** Headings stand alone; no small uppercase label above a heading. Nav section labels are sentence-case labels, not kickers.

**The Tabular Count Rule.** Every number that can change live — unread badges, member counts, reaction counts, timestamps — uses tabular figures so updates never jitter.

## Layout

The signed-in app is a full-viewport tool (`100dvh`): a 56px header across the top, then three columns — navigation (256px, Shelf), the conversation (fluid), and a members panel (240px) that appears only at ≥1280px and only in group channels. Only the conversation's message list scrolls; the header, channel header, typing line and composer are fixed in place.

Inside the conversation, messages and the composer share a centered column of max 64rem with 12px side gutters on phones and 24px from `lg`. Message groups are separated by 12px; consecutive messages from the same author within five minutes sit 2px apart with shared name and avatar. Day dividers and the unread divider use 16px vertical margin.

Document-like pages (profile, admin) scroll as pages inside a centered container: 48rem for profile, 64rem for admin, with 32–48px top padding. Settings use a two-column grid (13rem description column, fluid controls) from `md`, stacking on phones.

Responsive behavior is list → conversation below `lg` (1024px): `/channels` shows the navigation full screen; opening a conversation replaces it and the channel header gains a back button. The members panel becomes a right-hand sheet below `xl`. The composer respects `env(safe-area-inset-bottom)`, and phone list rows grow to 36px.

**The Only The Conversation Moves Rule.** Live updates (new messages, typing, presence) never shift the reading position: the typing line has a fixed 24px height and older pages are prepended with the scroll anchor preserved.

## Elevation & Depth

Flat by default. Depth comes from tone (Paper vs Shelf vs Mist) and 1px hairlines. Shadows exist only on elements that genuinely float above the page or need a lift to read as a single control.

### Shadow Vocabulary
- **Rest lift** (`box-shadow: 0 1px 2px rgb(0 0 0 / 0.04)`): the composer at rest.
- **Control lift** (`box-shadow: 0 1px 2px rgb(0 0 0 / 0.08)`): the selected segment in a segmented control.
- **Floating toolbar** (`box-shadow: 0 1px 2px rgb(0 0 0 / 0.06), 0 2px 8px -2px rgb(0 0 0 / 0.08)`): the message action bar.
- **Popover** (`box-shadow: 0 4px 16px -4px rgb(0 0 0 / 0.15)`): mention suggestions and similar anchored menus.

### Named Rules
**The Flat-At-Rest Rule.** Cards, list rows, bubbles and panels carry no shadow. If you reach for a shadow on something that does not float, use a tonal step or a hairline instead.

**The Focus Halo Rule.** Focus is shown with a solid ring or border in Focus Green plus a soft 3px ring at 20% — never with a shadow alone.

## Shapes

Gently rounded and consistent. Controls (buttons, inputs, nav rows) use 6px; containers that group content (lists, settings cards, the composer) use 8–12px; message bubbles use 16px; badges, presence dots, avatars and reaction pills are fully round.

Bubbles have a "tail" by grouping, not by drawing: the corner on the author's side tightens to 6px where a bubble continues into the next message from the same person (top for continuations, bottom for non-last). Deleted messages lose their fill and become a hairline outline.

Lists of records (admin channels, admin members) are a single rounded container with hairline dividers between rows, not a grid of separate cards.

## Components

Restrained and precise: flat at rest, a clear hover tone, a crisp focus ring, nothing that bounces.

### Buttons
- **Shape:** gently rounded (6px); 40px tall by default, 36px small; icon buttons are 40px squares.
- **Primary:** Signal Green fill, Signal Green Ink text, medium weight 14px. Hover darkens to 90%.
- **Outline:** Paper fill, hairline border, Ink text; hover to Mist.
- **Ghost:** transparent with Graphite icon/text; hover fills Mist and brings text to Ink. Used for all header and toolbar icons.
- **Destructive:** Alert Red fill with white text, only where the action deletes.
- **Loading:** a spinner is added before the label and the label changes to a gerund ("Entrando...", "Salvando...") — the button never collapses to a bare spinner.

### Chips
- **Reaction pill:** 24px tall, fully round, hairline border on Paper; your own reaction uses a Signal Green border at 50% over a 10% green fill. Counts are tabular.
- **Mention chip:** inline 4px-rounded span; Mention Amber fill when it names you, a 12% green tint for others, white at 20% on your own bubble.

### Cards / Containers
- **Corner Style:** 8px (settings cards), 12px (record lists, composer).
- **Background:** Paper; danger cards keep Paper with an Alert Red border at 40%.
- **Shadow Strategy:** none (see Flat-At-Rest).
- **Internal Padding:** 24px for settings cards; 12–16px for list rows.

### Inputs / Fields
- **Style:** Paper fill, hairline border, 6px radius, 40px tall.
- **Focus:** border shifts to Focus Green with the 3px soft ring.
- **Password:** a 40px eye toggle inside the right edge with an accessible "Mostrar/Ocultar senha" label.
- **Error / Disabled:** destructive text below the field; disabled fields dim to 50% and keep their value readable.

### Navigation
- **Sidebar rows:** 32px (36px on phones), 6px radius, `#` icon or 20px avatar with presence dot. Idle rows are Graphite; unread rows are Ink semibold with an unread badge; the active row sits on Shelf Selected with the `#` in Signal Green.
- **Section labels:** 12px medium Graphite with a rotating chevron; collapsing animates height with a 200ms ease-out.
- **Header:** 56px, hairline bottom border, brand mark left, search field centered (max 28rem, Mist at 50% with the platform shortcut), ghost icons right.
- **Tabs (admin):** underline tabs — 2px Signal Green underline on the active tab over a hairline baseline.

### Message Bubble (signature)
The core of the product. Others' bubbles sit left on Bubble Other with a 32px avatar shown only on the last message of a group; your bubbles sit right on Own Bubble Green with no avatar. Padding is 8px × 14px; timestamp and "editada" sit inside the bubble in Meta style. A message that mentions you gets a full-row Mention Amber tint at 40%. Replies show a quoted block at the top of the bubble (black 15% on own, ink 6% on others). The action bar (react, reply, more) floats beside the bubble on hover, focus, or a tap on touch screens.

### Composer (signature)
One surface: 12px radius, Paper, hairline border, Rest lift. Reply context and pending uploads stack inside the top of the surface, then a single row of attach (ghost), auto-growing borderless textarea (up to 12rem) and a 40px Signal Green send button. The whole surface takes the focus treatment. A one-line keyboard hint sits below it on desktop only. Dragging files over it turns the border Signal Green and shows "Solte os arquivos para anexar".

### Dividers
Day and unread dividers are centered labels between two hairlines; the unread divider uses Alert Red for both the label and the lines (at 40%).

## Do's and Don'ts

### Do:
- **Do** take every color from the semantic tokens in `src/index.css` (`bg-primary`, `bg-bubble-own`, `text-muted-foreground`, `bg-mention`, `bg-online`, `bg-unread`…) so both themes stay correct.
- **Do** keep the signed-in app at `100dvh` with only the message list scrolling.
- **Do** use a tonal step (Shelf, Mist) or a hairline before reaching for a border-heavy box or a shadow.
- **Do** give every live number tabular figures and every icon-only control an accessible label.
- **Do** design loading (skeletons shaped like the content), empty (icon disc + one line of guidance + an action when there is one) and error states for every list.
- **Do** keep motion short and ease-out (150–240ms, `cubic-bezier(0.16, 1, 0.3, 1)`) and honor `prefers-reduced-motion`.
- **Do** write all UI copy in pt-BR.

### Don't:
- **Don't** use raw Tailwind palette colors (`gray-*`, `green-*`, `red-*`, `bg-white`) outside `components/ui`; they break dark mode. White text is allowed only on dark scrims and the destructive fill.
- **Don't** use gradients on buttons or bubbles.
- **Don't** pulse, bounce or animate status indicators; presence is a static dot.
- **Don't** wrap app regions in cards or nest cards; the workspace is columns separated by hairlines.
- **Don't** add page-transition motion inside the chat; switching channels is instant.
- **Don't** apply `capitalize` to user-entered names or channel titles; render them as stored.
