# GitHub integration handoff

This folder is prepared as a standalone Gameorilla repository. No GitHub remote
has been added and nothing has been pushed.

## When GitHub is connected

1. Identify the canonical Gameorilla repository and its default branch.
2. Compare its current files with this scaffold before copying anything.
3. Preserve any production environment variables, deployment configuration,
   domain settings, analytics, and game code already present in the repository.
4. Move this scaffold onto a feature branch.
5. Install with the committed `pnpm-lock.yaml`.
6. Run `pnpm lint` and `pnpm test`.
7. Open a draft pull request describing which existing files were replaced or
   merged.
8. Review the preview deployment before merging.

## Systems still to connect

- Player authentication and account recovery
- Credits/tokens, subscription entitlements, and complimentary access codes
- Stripe checkout, customer portal, and verified webhooks
- Privacy-conscious session and game telemetry
- In-game feedback and error-reporting loop
- Admin tools for grants, support, usage review, and promotions
- Shared PTG catalog updates

## Recommended architecture boundary

Keep this repository responsible for:

- Gameorilla public pages
- Gameorilla game routes and brand-specific UI
- Gameorilla catalog configuration

Put shared commerce, identity, entitlement, feedback, telemetry, and PTG catalog
contracts in the common platform layer once that architecture is established.
This prevents Gameorilla and Gamearang from developing incompatible versions of
the same system.

## Pre-merge checks

- Confirm all human-facing references use **PoundTown Games** or **PTG**
- Confirm the production domain is `gameorilla.com`
- Replace type fallbacks with licensed canonical webfonts
- Obtain isolated official logo/mascot assets if higher-resolution source files
  exist
- Confirm game titles and availability labels with the product roadmap
- Verify mobile, keyboard, reduced-motion, and production payment flows
