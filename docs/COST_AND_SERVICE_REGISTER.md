# Cost and service register

| Service | Current use | Cost / key | Guardrail |
| --- | --- | --- | --- |
| MapLibre GL | Browser map renderer | Open-source, no key | Kept client-only; map failure shows a non-blocking fallback. |
| OpenFreeMap | Default basemap style | No key; service supplied as-is | Attribution remains visible. Before high traffic, review terms and prepare a self-hosted/provider fallback. |
| OpenStreetMap data | Map attribution | ODbL attribution required | Do not treat the public OSM tile service as an unlimited production tile API. |
| Supabase | Schema only; not connected at runtime | Not configured | Add a project URL and anon key only when a real project is provisioned; never expose service-role keys. |
| Vercel | Existing `.vercel` metadata found | Owner not verified | Do not relink or deploy until the owner confirms the intended project/team. |

## Environment variables

Copy `.env.example` to `.env.local` only when changing the map style or later connecting a backend. Public `NEXT_PUBLIC_*` values are intentionally visible in browser bundles; do not store secrets there.

## Operational note

The visible `Demo locations · manual updates` label is intentional. It prevents seed data from being represented as live operator-verified capacity.