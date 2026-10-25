# Upgrade plan — GRTSystem

## What was verified before changing code

The repository is a browser-local MVP: its customer discovery, floor plan, dashboard, survey and persistence already work through `localStorage`. A Supabase schema exists under `supabase/migrations`, but the application does not yet have a Supabase runtime client, authentication session, or deployed database connection. The project was not initialized as a Git repository when this upgrade began.

The guide mentions an existing map, bilingual UI, theme switcher and GitHub workflow. They were not present in the checked codebase, so this upgrade adds only the map-discovery foundation and documents the remaining production path rather than pretending those services already exist.

## Delivered in this upgrade

- Map discovery page using MapLibre GL with OpenFreeMap as the default no-key basemap.
- Visible OpenFreeMap/OpenMapTiles/OpenStreetMap attribution.
- Five clearly marked demo seed locations; the distance is straight-line demo distance, not an ETA.
- Map markers and the preview use a customer-safe availability label. `unavailable` capacity is never counted as free capacity.
- Shared availability rules, search/filter helper, and explicit safe seat-transition rules.
- 39 automated tests covering domain rules and manager transitions.
- Environment template, cost/service register, and a CI workflow for a future GitHub repository.

## Deliberately deferred until a real deployment decision

- Supabase client/auth and real-time subscriptions.
- Staff roles, verified venue onboarding, images, real routing/ETA, notification delivery and analytics.
- Vietnamese/English content across every pre-existing MVP screen and theme persistence. These are safe next UI iterations but should be designed together with authenticated user preferences rather than partially translating storage-backed demo content.

## Acceptance checks

Run `npm test`, `npm run lint`, `npx tsc --noEmit`, and `npm run build`. For manual checks, use the checklist in `TESTING.md`.