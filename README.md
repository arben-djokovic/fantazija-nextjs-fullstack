# Fantazija.me – Pastry Shop Website & Online Ordering

Website and online ordering for **Fantazija**, a pastry shop in Tuzi, Montenegro (open since 2012). Customers browse the cake and pastry offer, design their own cake in a step-by-step builder, and send an order for pickup. The staff manage orders and products in an admin panel.

- **Website**: https://fantazija.me

Built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS 4**, **MongoDB (Mongoose)** and **AWS S3**.

## Features

### For customers

- **Three languages**: Montenegrin (`me`, default, no URL prefix), Albanian (`/sq`) and English (`/en`) via [next-intl](https://next-intl.dev/). Products are stored with names and descriptions in all three languages.
- **Offer catalogue**: cakes (by category) and other products, each with one or more options (size, number of servings, price). A price can also be "agreed by phone".
- **Cake builder** ("Napravi sam"): pick a classic, premium or special cake, flavour and size, add an edible photo, an inscription, wishes, and fasting or gluten-free variants. Customers can attach up to 3 reference photos. The price is calculated live, and special requests switch to phone pricing.
- **Cart and checkout**: the cart is saved in `localStorage`; checkout asks for name, phone, pickup date and time, and whether the customer wants a confirmation on Viber.
- Gallery, about and contact sections, Google Maps and Instagram links.
- **SEO**: per-locale metadata, `sitemap.xml`, `robots.txt`, Open Graph share image and `LocalBusiness` JSON-LD.

### Admin panel (`/admin`)

- Login with username and password (bcrypt); the session is a signed JWT (HS256, `jose`) in an `httpOnly` cookie for 7 days. The user's role and active status are read from the database on every request, so a deactivated account is locked out immediately.
- Two roles:
  - **admin** (owner): everything, including product management.
  - **staff** (workers): orders only.
- **Orders**: views for today, tomorrow and new orders, a day picker, and a summary of how many of each cake to make. Status flow `new → confirmed → ready → completed` (or `cancelled`), with limited steps back to fix mistakes. Staff can edit an order, set the price agreed by phone, and add an internal note. Every change is recorded in the order history with who made it and when.
- **Products**: create, edit, hide and sort products, mark them as featured on the home page, and upload photos to S3.

### Under the hood

- Order names and prices are copied into the order when it is placed, so later changes to the offer don't change old orders.
- Custom cake prices are calculated again on the server from the same rules the builder uses (`src/data/cakeBuilder.js`), so the client cannot change the price.
- Image uploads are checked for type (JPG, PNG, WEBP, AVIF, GIF) and size (max 5 MB). The public customer upload route is rate-limited per IP.
- Login takes the same time whether the username exists or not, so it doesn't reveal valid usernames.
- `GET /api/health` checks that the server is up and the database is reachable.

## Tech Stack

| Area         | Technology                                   |
| ------------ | -------------------------------------------- |
| Framework    | Next.js 16 (App Router), React 19            |
| Styling      | Tailwind CSS 4, Lucide and React Icons       |
| i18n         | next-intl                                    |
| Database     | MongoDB with Mongoose                        |
| File storage | AWS S3 (`@aws-sdk/client-s3`)                |
| Auth         | bcryptjs (password hashing), jose (JWT)      |

## Project Structure

```
messages/                # Translations (me, sq, en)
public/                  # Static assets (logo, flags, share image)
src/
├── app/
│   ├── [locale]/        # Public pages: home, offer, cake builder, gallery, checkout
│   ├── admin/           # Admin panel: login, orders, products
│   ├── api/             # Route handlers: items, orders, uploads, auth, admin, health
│   ├── sitemap.js, robots.js
│   └── layout.js
├── components/          # UI components (admin/ holds the admin panel components)
├── data/                # Static data and business rules (cake builder, statuses, contact)
├── i18n/                # next-intl routing and request config
├── lib/                 # DB connection, auth/session, S3, orders, SEO helpers
├── models/              # Mongoose models: Item, Order, User
└── proxy.js             # Locale routing (skips /api and /admin)
```

## Getting Started

### Prerequisites

- Node.js 20.9 or newer (required by Next.js 16)
- A MongoDB database (local or MongoDB Atlas)
- An AWS S3 bucket for product and customer photos

### 1. Clone and install

```bash
git clone https://github.com/arben-djokovic/fantazija-nextjs-fullstack.git
cd fantazija-nextjs-fullstack
npm install
```

### 2. Environment variables

Create `.env.local` in the project root:

```env
# Database
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<database>

# Signs the session cookie: use a long random string
SESSION_SECRET=replace-with-a-long-random-string

# Public site URL, used for SEO (sitemap, canonical links, share image)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# AWS S3
BUCKET_NAME=your-bucket-name
BUCKET_REGION=eu-north-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

To generate a session secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

> **Never commit `.env.local`.** It is already listed in `.gitignore`.

**S3 setup.** All images go under the `fantazija-products/` prefix (customer photos in `fantazija-products/orders/`). The bucket policy must allow public read for that prefix only, because the site shows images from their public URLs. Give the IAM user `s3:PutObject` on `fantazija-products/*` and nothing more.

### 3. Create an admin account

There is no sign-up page; accounts are created directly in the database. For example, with the Node REPL from the project root:

```bash
node --env-file=.env.local -e "
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.collection('users').insertOne({
    username: 'admin',
    name: 'Owner',
    passwordHash: await bcrypt.hash('change-me', 12),
    role: 'admin',          // or 'staff'
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await mongoose.disconnect();
})();
"
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The admin panel is at [http://localhost:3000/admin](http://localhost:3000/admin).

### Other scripts

```bash
npm run build   # production build
npm run start   # serve the production build (run build first)
npm run lint    # ESLint
```

## Deployment

The site runs on Vercel. Add the variables from `.env.local` in the project's environment settings (not the file itself) and set `NEXT_PUBLIC_SITE_URL` to the production domain.

Note: the upload rate limit is kept in server memory, so on serverless hosting it applies per instance. It protects against simple abuse, not against a determined attacker.

## Author

Arben Djokovic – [GitHub](https://github.com/arben-djokovic)
