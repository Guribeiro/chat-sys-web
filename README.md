# Realtime chat — web

A real-time internal chat for teams: channels for shared topics, 1:1 direct messages, and enough
structure (roles, invites, search) to work as a team's everyday communication tool. This is the
front-end; the back-end lives in [chat-sys-api](https://github.com/Guribeiro/chat-sys-api).

Product and design references: [`PRODUCT.md`](PRODUCT.md) (users, purpose, principles) and
[`DESIGN.md`](DESIGN.md) (visual system and tokens).

## Features

- **Conversations:** channels and 1:1 direct messages, with infinite scroll back through history
- **Messages:** replies, @mentions, emoji reactions, Markdown, edit/delete, file and image attachments with preview
- **Real time:** new messages, typing indicator, online presence and unread badges, over Socket.io
- **What needs me:** activity panel (mentions and replies), per-conversation mute, desktop notifications while the tab is hidden
- **Search:** global full-text search across every channel (`Ctrl K` / `⌘ K`), jumping straight to the message
- **Channel management:** members (roles, removal, ownership transfer), invites, settings (rename, deactivate, delete), and a "Canais que administro" area
- **Account:** sign-up, password recovery by e-mail, profile and avatar, password change, light/dark theme
- Responsive layout for mobile and desktop; the UI is in Brazilian Portuguese

## Built With

- **[React 18](https://react.dev/)** + **[TypeScript](https://www.typescriptlang.org/)**, built with **[Vite](https://vitejs.dev/)**
- **[TanStack Query](https://tanstack.com/query)**: server state, cache and infinite pagination
- **[React Router](https://reactrouter.com/)**: routing
- **[Zustand](https://zustand-demo.pmnd.rs/)**: client state (session, layout, preferences, presence)
- **[Socket.io client](https://socket.io/)**: real-time events
- **[Axios](https://axios-http.com/)**: HTTP client, refreshing the access token once on a `401`
- **[React Hook Form](https://react-hook-form.com/)** + **[Zod](https://zod.dev/)**: forms and validation
- **[Tailwind CSS 4](https://tailwindcss.com/)** + **[shadcn/ui](https://ui.shadcn.com/)** (Radix UI): styling and components
- **[react-markdown](https://github.com/remarkjs/react-markdown)** + remark-gfm: message rendering
- **[Sonner](https://sonner.emilkowal.ski/)** (toasts), **[Framer Motion](https://motion.dev/)** (transitions), **[Geist](https://vercel.com/font)** (typeface)

## Getting Started

### Running with Docker (recommended)

The whole stack runs from the docker-compose in the API repository: PostgreSQL, Redis, the API
(port 3333), the realtime server (Socket.io, port 3334), Mailpit and this front-end. Clone both
repositories side by side (`chat-sys/api` and `chat-sys/web`) and run:

```bash
cd ../api
docker compose up --build -d
docker compose exec api pnpm prisma db seed   # optional: demo data, login gustavo@gmail.com / 123456
```

The app will be available at http://localhost:8080 with hot reload. See the
[API README](https://github.com/Guribeiro/chat-sys-api#readme) for the other services and commands.

### Running locally

Prerequisites:

- [Node.js](https://nodejs.org/) (v22 or higher)
- [pnpm](https://pnpm.io/) (v9). The project uses `pnpm-lock.yaml`; other package managers are not supported
- The API running (for example `docker compose up -d db redis api realtime` in the API repository)

1. Clone the repo
   ```sh
   git clone https://github.com/Guribeiro/chat-sys-web.git
   ```
2. Install the dependencies
   ```sh
   pnpm install
   ```
3. Create a `.env.local` file from `.env.local.example` (see below).
4. Start the development server
   ```sh
   pnpm dev
   ```

### Environment variables

| Variable | Default | What it is |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:3333` | REST API base URL (also used for uploaded files) |
| `VITE_SOCKET_URL` | `VITE_API_URL` | Socket.io server. Use `http://localhost:3334` when the API runs with `REALTIME_MODE=standalone` (the Docker default), or leave it unset when Socket.io runs inside the API (`embedded`) |

The socket connects with `transports: ['websocket']` (no HTTP long-polling first), so several
realtime instances behind a load balancer need no sticky sessions. Networks that block WebSocket
cannot connect.

## Available Scripts

- `pnpm dev`: runs the app in development mode.
- `pnpm build`: builds the app for production to the `dist` folder.
- `pnpm build:dev`: builds the app in development mode.
- `pnpm lint`: lints the code with ESLint.
- `pnpm preview`: serves the production build locally.

## Routes

| Path | Page |
| --- | --- |
| `/` · `/signup` | Sign in · sign up |
| `/forgot-password` · `/reset-password/:code` | Password recovery |
| `/channels/:slug` | Conversation (channel or DM) |
| `/channels/:slug/manage/members` · `invites` · `settings` | Channel management (admins) |
| `/profile` | Profile, avatar, password and desktop notifications |
| `/admin/channels` | Channels I administer |

Every route except sign-in, sign-up and password recovery requires a session.

## Project Structure

```
src
├── components   # UI: chat, channel sidebar, members panel, activity, search, header, shadcn/ui primitives
├── hooks        # React Query hooks (channels, channel details, users, admin channels)
├── http         # Axios client, session refresh and one function per API call
├── lib          # Utilities (asset URLs, desktop notifications, platform detection, error handling)
├── pages        # Route pages, including admin/ and channel-manage/
├── routes       # Router, private route guard and page transitions
├── schemas      # Zod schemas for forms
├── socket       # Socket.io client and the typed event contract
└── store        # Zustand stores: auth, layout, preferences, presence
```

`src/socket/events.ts` mirrors the API's
[`src/socket/events.ts`](https://github.com/Guribeiro/chat-sys-api/blob/main/src/socket/events.ts);
keep both in sync when an event changes.

## Contributing

Contributions are welcome. Open an issue or fork the repo and open a pull request:

1. Fork the project
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add some amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a pull request

## License

Distributed under the MIT License.

## Contact

Gustavo Ribeiro - [@guribeir](https://twitter.com/guribeir) - guribeirodeveloper@gmail.com

Project Link: [https://github.com/Guribeiro/chat-sys-web](https://github.com/Guribeiro/chat-sys-web)
