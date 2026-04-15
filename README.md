# RK Suppliers - Bag Wholesale Website

A beautiful, fully functioning wholesale bag store website built with **Next.js**, **PocketBase**, and **Tailwind CSS**.

---

## 📁 Project Structure

```
rk-suppliers/
├── app/                    # All pages go here (Next.js App Router)
│   ├── layout.js           # Shared layout with Navbar & Footer
│   ├── page.js             # Home page
│   ├── globals.css         # Global styles & Tailwind
│   ├── products/
│   │   ├── page.js         # Products listing page
│   │   └── [id]/page.js    # Single product detail page
│   ├── about/page.js       # About page
│   ├── contact/page.js     # Contact page with form
│   └── admin/page.js       # Admin dashboard (password protected)
├── components/
│   ├── Navbar.js           # Top navigation bar
│   ├── Footer.js           # Footer
│   └── ProductCard.js      # Reusable product card
├── lib/
│   └── pocketbase.js       # Database connection & helper functions
├── .env.local.example      # Example environment variables
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind theme (colors, fonts)
└── package.json
```

---

## 🚀 Setup Instructions

### Step 1 - Install PocketBase

PocketBase is a free, simple database that runs as a single file.

1. Go to https://pocketbase.io/docs/ and download the binary for your OS
2. Create a folder and place the `pocketbase` file inside it
3. Run it:
   ```bash
   ./pocketbase serve
   ```
4. Open http://127.0.0.1:8090/_/ in your browser
5. Create your admin account when prompted

### Step 2 - Create PocketBase Collections

In the PocketBase Admin UI (http://127.0.0.1:8090/_/), create these collections:

#### Collection 1: `products`
| Field Name   | Type    | Notes                     |
|--------------|---------|---------------------------|
| name         | Text    | Required                  |
| description  | Text    | Long text                 |
| price        | Number  | Wholesale price in Rs.    |
| min_order    | Number  | Minimum order quantity    |
| category     | Text    | e.g. Backpacks, Handbags  |
| stock        | Number  | Available quantity        |
| image        | File    | One image file            |

#### Collection 2: `contacts`
| Field Name | Type | Notes          |
|------------|------|----------------|
| name       | Text | Required       |
| email      | Text |                |
| phone      | Text |                |
| message    | Text | Long text      |

**Important:** In PocketBase, set the API Rules for each collection:
- `products`: List/View = allow everyone (empty rule). Create/Update/Delete = admin only.
- `contacts`: List/View = admin only. Create = allow everyone (empty rule).

### Step 3 - Set Up the Next.js Project

1. Unzip the project files
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment file:
   ```bash
   cp .env.local.example .env.local
   ```
4. Edit `.env.local` if needed (the defaults work for local development)

### Step 4 - Run the Website

Make sure PocketBase is running, then:
```bash
npm run dev
```

Open http://localhost:3000 in your browser. 🎉

---

## 🔐 Admin Panel

Visit http://localhost:3000/admin

Default password: `admin123`

**To change the password:**
Edit `.env.local` and update `ADMIN_PASSWORD=yourpassword`

> ⚠️ Note: This is a simple password for beginners. For a real production site, you'd use proper authentication.

In the admin panel you can:
- ➕ Add new products with images
- ✏️ Edit existing products
- 🗑️ Delete products
- 📬 View customer contact messages

---

## 🎨 Customization

### Change Business Info
- **Name, phone, address**: Edit `components/Navbar.js` and `components/Footer.js`
- **Hero text**: Edit `app/page.js`
- **About us content**: Edit `app/about/page.js`

### Change Colors
Edit `tailwind.config.js` - look for the `colors` section:
```js
colors: {
  navy: { DEFAULT: '#0d1b2a', ... },  // Main dark color
  gold: { DEFAULT: '#c9a96e', ... },  // Accent color
  cream: { DEFAULT: '#f8f4ef', ... }, // Background
}
```

### Add Categories
Update the `CATEGORIES` array in:
- `app/page.js` (home page grid)
- `app/products/page.js` (filter tabs)
- `app/admin/page.js` (dropdown in form)

---

## 🌐 Deploying to the Internet

When you're ready to go live:

1. Deploy PocketBase on a VPS (Digital Ocean, Hetzner, etc.) or use PocketBase Cloud
2. Update `NEXT_PUBLIC_POCKETBASE_URL` in `.env.local` to your live PocketBase URL
3. Deploy Next.js on Vercel (free): https://vercel.com
4. Set your environment variables in Vercel's dashboard

---

## 🛠️ Built With

- **Next.js 14** - React framework for the website
- **PocketBase** - Backend database & file storage
- **Tailwind CSS** - Styling
- **Playfair Display + DM Sans** - Google Fonts

---

Happy selling! 🛍️
