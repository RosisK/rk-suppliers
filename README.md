# RK Suppliers

A Next.js wholesale bag store using Supabase for database access and admin authentication.

## Stack

- Next.js App Router
- Supabase Postgres
- Supabase Auth
- Tailwind CSS

## Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_PRODUCT_BUCKET=product-images
NEXT_PUBLIC_SITE_URL=https://www.example.com
```

## Supabase Setup

1. Open your Supabase SQL editor.
2. Run [supabase/schema.sql](/C:/Users/Lenovo/Desktop/rk-suppliers/supabase/schema.sql).
3. In Supabase Auth, create the admin user you want to use for `/admin`.
4. Copy that user's `id` from Supabase Auth and insert it into `public.admin_users`.

Example:

```sql
insert into public.admin_users (user_id)
values ('your-auth-user-uuid');
```

## Data Model

The app expects these tables:

- `products`
- `contacts`
- `orders`
- `admin_users`

Product images are uploaded to the Supabase Storage bucket `product-images`, and the app stores the file path in `products.image_path`.

## Development

Install dependencies and run the app:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Admin Access

Visit `http://localhost:3000/admin` and sign in with your Supabase Auth email/password.

Admin access is enforced by Supabase RLS policies, not by a client-side password.

## Notes

- Public visitors can read products and submit contacts/orders.
- Admins can manage products, view contacts, and update order status.
- Admins can upload and delete product images in Supabase Storage.
- The public catalog and product pages are server-rendered for SEO.
