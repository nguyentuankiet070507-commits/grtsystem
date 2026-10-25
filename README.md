# GRTSystem MVP

Responsive Next.js demo for real-time café seat occupancy. It runs locally without credentials using browser storage and synchronizes updates between open tabs. This lets the customer detail page and manager dashboard demonstrate the realtime manual workflow immediately.

## Run locally

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`. Use **Staff login** and then the dashboard to update individual seats or an entire table. Open the same café in another browser tab to observe the update without reloading.

## Production Supabase connection

The included migration at `supabase/migrations/202609280001_initial_schema.sql` creates the MVP data model, core RLS policies, session invariant, and Realtime publication. Before deploying, implement server-side RPCs for atomic seat updates: they must update the seat, open/close the matching session, and write an occupancy snapshot in one transaction. Never use a service role key in the browser.

Set only these public browser variables in Vercel after creating a Supabase project:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Then replace the local store adapter (`src/lib/store.ts`) with typed Supabase queries and a scoped `floor_seats` subscription for the current café. The UI/model layer deliberately does not depend on whether updates are `manual` or `camera_ai`.
# grtsystem
