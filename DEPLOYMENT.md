# Deploy GRTSystem (Supabase + Vercel)

This project is intentionally not deployed yet. The local demo has no user data or Supabase credentials. Follow the steps below only after you have tested it locally and want a public demo URL.

## 1. Prepare the repository

Create a GitHub repository, commit the `grtsystem` folder, and push it. Confirm this passes locally first:

```powershell
npm test
npm run build
```

Do not commit `.env.local`, Supabase service-role keys, or real test-account passwords.

## 2. Create a Supabase project

1. In Supabase, create a new project for **development/demo**. Do not use a production database while learning the migration workflow.
2. In the project **Connect** panel, copy the Project URL and the **publishable** key. The publishable key is okay in the browser; the service-role key is not.
3. Install and authenticate the Supabase CLI locally, then link only this demo project:

   ```powershell
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase db push
   ```

4. Inspect the SQL first. The migration at `supabase/migrations/202609280001_initial_schema.sql` enables RLS, creates public read policies, limits staff updates to assigned cafés, and enables Realtime for `floor_seats`.
5. Create the test users manually in Supabase Auth, then add their matching `profiles` and `cafe_managers` rows through an admin-only setup script or the SQL editor. Do not place their passwords in source control.

## 3. Complete the Supabase adapter before going public

The current UI deliberately uses `src/lib/store.ts`, an offline browser-store adapter, so it can be demoed with no credentials. Before public deployment, replace it with typed Supabase reads/writes and a subscription scoped to the café being viewed.

For each status change, use a server-side Postgres RPC/transaction that atomically:

1. verifies that the signed-in manager is assigned to the café;
2. transitions the seat state;
3. opens a session when becoming occupied, or closes the open session when becoming available;
4. writes an `occupancy_updates` snapshot.

The client must never directly create a session based on stale local state. Test this with two manager sessions before publishing.

## 4. Configure Vercel

1. Import the GitHub repository in Vercel and set the root directory to `grtsystem` if the repository contains more than this app.
2. Add these environment variables for Preview and Production:

   ```text
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
   ```

3. Deploy. Re-deploy whenever environment variables change.
4. In Supabase Auth URL configuration, add the Vercel production URL and each preview URL pattern you intend to use as redirect URLs.

## 5. Production smoke test

- Open the home page on desktop and a phone.
- Open a café detail page and confirm the floor plan, timer, stale-data label, recommendations, reviews, and history appear.
- Sign in as the assigned manager. Update one seat, then a whole table.
- In a second browser/device, confirm the customer floor plan changes without a page reload.
- Mark a seat available and confirm its matching occupancy session closes.
- Check a full café: show a range only when enough historical sessions exist; otherwise show the insufficient-data message.
- Attempt a seat mutation with a customer and with a manager of another café. Both must fail due to RLS.
- Inspect browser source/network requests: no service-role key must be present.

## 6. Rollback

If a deployment has a UI regression, promote the previous Vercel deployment. Do **not** run a destructive remote database reset. Apply a new forward migration for database corrections.
