<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/b26b5dff-655a-41d8-96c6-5300c91d0945

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Account Access

Sign-up, sign-in, email confirmation, and password recovery use Supabase Auth.

1. Create a Supabase project and enable the Email provider.
2. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the Supabase project API settings.
3. In Supabase Auth URL Configuration, set the site URL and allow the local callback URLs `http://localhost:3000/account/*` and `http://localhost:3001/account/*`, plus the production account callback URL when deployed.
4. Restart the Vite server after changing `.env.local`.

Only use the public anon/publishable key in this frontend. Never expose a service-role key through a `VITE_` variable. The selected buyer/producer account type is stored as user metadata and must not be used as an authorization boundary; enforce permissions with server-side policies and database row-level security.

### Shared marketplace data

The ordered migrations in [`supabase/migrations/`](./supabase/migrations/) create user profiles, inventory, conversations, messages, trade orders, shipment records, and the admin console. Apply both migrations, in filename order, to your Supabase project using either:

- Supabase CLI: `supabase link --project-ref YOUR_PROJECT_REF`, then `supabase db push`.
- Supabase Dashboard: open **SQL Editor**, create a new query for each migration, paste the complete file contents, and run them in filename order. If the first marketplace migration is already installed, run only the newer `20261030000001_admin_console.sql` migration.

After applying the migration, sign in with a user account. Marketplace listings will show inventory published by users; producers can add and manage their own inventory. Signed-in buyers can start listing-specific conversations and submit order requests. Sellers can accept or decline pending requests, and buyers can cancel pending requests. Order requests reserve stock until the seller declines or the buyer cancels.

The admin console is available at `/admin` to users explicitly assigned the `admin` database role. To grant access, first create the account and confirm it appears in **Authentication → Users**, then run this in the Supabase SQL Editor, replacing the email with the trusted account:

```sql
insert into public.user_roles (user_id, role)
select id, 'admin'
from auth.users
where lower(email) = lower('admin@example.com')
on conflict (user_id, role) do nothing;
```

The result should insert one row. If it inserts zero rows, check that the account exists and the email matches. To revoke access, run:

```sql
delete from public.user_roles
where role = 'admin'
  and user_id = (select id from auth.users where lower(email) = lower('admin@example.com'));
```

The admin page provides account-directory review, listing hide/restore moderation, and order status management. It does not suspend or delete Supabase Auth users; perform account-level actions from Supabase Dashboard. Admin role changes are deliberately done in SQL, not from the browser. The role table cannot be edited by frontend users, and every admin data function checks the database role.

Checkout records an order request only. There is no payment provider, escrow, carrier tracking feed, or sensor integration connected. After accepting an order, the seller can add a shipment record from the shared order panel; real-time carrier status updates are not connected. Existing browser sample records are not uploaded or treated as real orders.

If Supabase is configured but its migration has not been applied, shared-data requests will report an error rather than falling back to private browser samples. Never put a service-role or secret key in a `VITE_` variable. Account metadata such as buyer/producer selection is not an authorization boundary; database row-level security and server-side checks enforce access.

## Deploy to Netlify

This is a Vite single-page app. The root [`netlify.toml`](./netlify.toml) sets the build command, publishes `dist`, and routes direct requests such as `/admin` and `/account/sign-in` back to the app.

### Git-connected deployment (recommended)

1. Push the project to a GitHub repository. Do not commit `.env.local`; it is ignored by Git.
2. In Netlify, choose **Add new site → Import an existing project**, connect the repository, and select the production branch. Keep the base directory at the repository root; Netlify reads the build settings from `netlify.toml`.
3. If you want sign-in and shared marketplace data, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Netlify site's environment-variable settings. Get these from your Supabase project's API settings. Use only the public anon/publishable key—never a service-role key.
4. Deploy the site. In Supabase **Authentication → URL Configuration**, set the Site URL to your Netlify URL and add `https://YOUR-SITE.netlify.app/account/*` to the allowed redirect URLs. If you add a custom domain, set that as the Site URL and allow its account callback URL too.
5. Apply the Supabase migrations as described above if you have not already.

Netlify reads `VITE_` variables while building, so after adding or changing them, trigger a new deploy. Without the Supabase variables, the site can still build, but account access and shared marketplace data will not be configured.

### Updating the hosted site

Yes—you can keep changing it after it is hosted. With Git-connected deployment, edit the project, commit and push to the connected branch, and Netlify will build and publish the update automatically. For a one-time manual deploy instead, run `npm run build` and upload the generated `dist` directory in Netlify; repeat the build and upload whenever you want to publish changes.
# Agroline-Ltd
# AgroLine-Ltd
