# Gameorilla

Repository-ready local website starter for **gameorilla.com**, a PoundTown Games
property.

This version establishes the public vice-arcade brand shell, a data-driven game
catalog, responsive layouts, accessible navigation, and implementation
documentation. It does not yet include player accounts, payment processing,
subscriptions, access codes, telemetry, or live game logic.

## Run locally

Requirements:

- Node.js 22.13 or newer
- pnpm 11

```bash
pnpm install
pnpm dev
```

Then open the local URL printed by the development server.

## Verify

```bash
pnpm lint
pnpm test
```

`pnpm test` creates a production build and verifies the important homepage
content from the rendered server output.

## Project map

- `app/page.tsx` — public Gameorilla homepage
- `app/globals.css` — responsive vice-arcade design system
- `lib/gameorilla-brand.ts` — palette, game catalog, audio rules, and build map
- `public/brand/reference/` — supplied canonical brand-kit pages
- `docs/GAMEORILLA-BRAND-IMPLEMENTATION.md` — design decisions and guardrails
- `docs/GITHUB-INTEGRATION.md` — steps to move this scaffold into the connected
  Gameorilla repository

## Current game roadmap

1. **Fill in the Blank** — first planned Gamearang-to-Gameorilla adaptation
2. **Night Shift Trivia** — queued catalog concept
3. **Neon Whodunit** — future social mystery concept

Catalog entries are content placeholders, not claims that the games are already
implemented.

## Hosting

This scaffold uses the OpenAI Sites-compatible vinext starter and Cloudflare
runtime. It is intentionally local-only for now. Once the Gameorilla GitHub
repository and production hosting target are confirmed, use
`docs/GITHUB-INTEGRATION.md` before deploying.
