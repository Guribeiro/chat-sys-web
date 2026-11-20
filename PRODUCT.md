# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary (in-product):** members of a company team using an internal chat as a daily work tool — e.g. people in departments like Financeiro, TI, Recursos Humanos, Marketing, Vendas, or a project squad. They switch between channels and direct messages many times a day, scan for what is new or addressed to them, reply, react, share files, and look up past decisions.

**Secondary (evaluation context):** this is a portfolio project. The people judging it are recruiters, developers/tech leads, and designers. The product is presented as a real internal team chat, not as a self-described demo; the portfolio context explains why it exists, not how it behaves.

## Product Purpose

A real-time internal chat for teams: channels for shared topics, 1:1 direct messages, and enough structure (roles, invites, search) to work as the team's everyday communication tool.

Success has two layers:
- **For the in-product user:** they always know where new activity is and what needs them, and can act on it in seconds.
- **For evaluators:** within a few minutes it reads as a finished product — recruiters see polish, tech leads see sound real-time engineering, designers see care in states, accessibility, dark mode and mobile.

## Positioning

A complete, self-hostable team chat whose whole stack (React client, Express/Socket.io API, Postgres) was built by one developer, end to end. What makes it credible is that the hard parts of chat are actually implemented, not mocked: live presence and typing, unread counts, optimistic sends, cursor pagination, Portuguese full-text search with jump-to-message, attachments with thumbnails, mentions with notifications.

## Operating Context

- Interface language is Brazilian Portuguese (pt-BR) throughout, including errors and dates.
- Used on desktop during the workday and on phones in between; both must be first-class.
- Light and dark themes, following the system by default.
- Local stack via Docker Compose (`../api`): web on :8080, API on :3333, Postgres, and Mailpit (:8025) catching dev e-mails such as password recovery.
- Seed data provides a realistic company workspace (login `gustavo@gmail.com` / `123456`).

## Capabilities and Constraints

- **Accounts:** sign-up, sign-in (short-lived JWT + rotating refresh tokens), password recovery by e-mail, profile name/avatar, password change (ends other sessions).
- **Channels:** type `GROUP` with roles (owner / ADMIN / MEMBER), invites (accept/reject), member management, active/inactive status, rename, delete.
- **Direct messages:** channels of type `DIRECT` between two users.
- **Messaging:** real-time via Socket.io; edit/delete (admins can moderate), replies, @mentions with notifications, emoji reactions, Markdown (GFM, no images/raw HTML), file and image attachments, typing indicator, unread counts, presence.
- **Search:** full-text across every channel the user belongs to, with Portuguese stemming and jump to the message.
- **Terminology:** "canal", "mensagens diretas", "membro", "administrador", "convite", "menção".
- **Stack (existing):** React 18 + Vite + TypeScript, Tailwind CSS 4 + shadcn/Radix, TanStack Query, Zustand, socket.io-client. API and web are separate repositories cloned side by side under `chat-sys/`.
- **Open:** public deployment target and URL; a formal accessibility standard (see below).

## Brand Commitments

- Name: **Realtime chat**.
- Voice: plain, friendly, work-appropriate Portuguese; controls name their action, errors say what happened and what to do.

## Evidence on Hand

- Working product with seeded workspace data (users, channels, DMs, messages, reactions, attachments) — `../api/prisma/seed.ts`.
- API test suite (Vitest + Supertest) — `../api`.
- No real users, customers, testimonials, usage metrics or press exist. Do not fabricate any.

## Product Principles

1. **Behave like a real tool.** Every surface should work as it would for a real team; no placeholder screens, fake data claims or "demo" framing inside the app.
2. **Attention is the product.** What is new, unread or addressed to me must be findable at a glance; everything else stays quiet.
3. **Real-time without surprises.** Live updates must never move what the user is reading or lose what they typed.
4. **Finished in every state.** Empty, loading, error, offline, long content, mobile and dark mode are part of the feature, not afterthoughts — evaluators will look there.
5. **The engineering should be visible through the experience,** not through explanatory UI.

## Accessibility & Inclusion

No formal standard has been set yet (open decision). Current practice: keyboard-reachable actions, visible focus, labelled icon-only controls, reduced-motion support, and text contrast checked in both themes.
