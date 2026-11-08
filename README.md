# Ghar Foundation 🏔️

Ghar Foundation is a production-ready rental property platform focused exclusively on **Uttarakhand, India**. 

The platform simplifies home search and listings for renters, property owners, and local brokers. Built with a focus on speed, mobile-first design, and low-bandwidth resilience, it functions smoothly on lower-end mobile devices and slow internet connections.

---

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS & Material UI (MUI v6/v7 compatible)
- **Database**: PostgreSQL & Prisma ORM
- **Authentication**: Social Logins (Google, Apple) & Phone OTP Sign-In
- **Image Storage**: Cloudinary (with client-side compression)
- **State Management**: TanStack Query (React Query) & Context Providers

---

## 📂 Project Structure

```text
gharfoundation/
├── prisma/
│   └── schema.prisma          # PostgreSQL Relational Schemas
├── public/
│   └── manifest.json          # PWA Mobile Web App Manifest
└── src/
    ├── app/
    │   ├── globals.css        # Global CSS overrides & variables
    │   ├── layout.tsx         # Root Layout, Metadata & Providers
    │   ├── page.tsx           # Home Landing Page with dynamic city lists
    │   ├── sitemap.ts         # Dynamic SEO Sitemap generator
    │   ├── robots.ts          # Search crawler rules (Robots.txt)
    │   ├── login/
    │   │   └── page.tsx       # Auth panel with OTP/Google/Apple and onboarding
    │   ├── search/
    │   │   ├── page.tsx       # Search fallback suspenser
    │   │   └── SearchContent.tsx # Search engine lists, filters & coordinates
    │   ├── property/
    │   │   └── [id]/
    │   │       ├── page.tsx   # dynamic route params resolver
    │   │       └── PropertyDetailsContent.tsx # galleries, maps, review systems
    │   └── dashboard/
    │       └── page.tsx       # Unified role switcher (Renter, Owner, Broker, Admin)
    ├── components/
    │   ├── property/
    │   │   ├── PropertyCard.tsx # Reusable rental preview card
    │   │   └── PropertyMap.tsx  # Simulated canvas map grid
    │   └── shared/
    │       ├── Navbar.tsx     # Responsive navigation & active role debugger
    │       └── Footer.tsx     # Uttarakhand districts directory footer
    └── lib/
        ├── types.ts           # Entity typings (User, Property, Message...)
        ├── mockData.ts        # Rich mock listings, reviews, and messaging streams
        ├── context/
        │   ├── AuthContext.tsx  # Role transitions & auth actions
        │   ├── ThemeContext.tsx # Tailwind Sync & Custom MUI Themes
        │   └── ToastContext.tsx # Snackbar status triggers
        └── services/
            ├── cloudinary.ts    # Cloudinary uploaders & client compressors
            ├── email.ts         # Transact email generators
            └── notifications.ts # FCM Push & WhatsApp trigger interfaces
```

---

## ⚙️ Setup & Installation

### 1. Install Dependencies
Ensure you have Node.js 18+ installed. Run the following command in the project root:
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in your keys:
```bash
cp .env.example .env
```

### 3. Initialize Database
Ensure a PostgreSQL database (local or hosted like Neon) is running. Set the connection URL in `DATABASE_URL` and run the migrations:
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## ⚡ Role Simulation & Verification Mode
To help verify user roles during development, we've integrated a **Simulation Panel** into the right side of the Navigation Bar:
- **Guest**: Browse listings. Adding favorites or messaging triggers registration redirects.
- **Renter**: Create/Manage Favorites, Save Searches, chat in the Real-Time Inbox.
- **Property Owner**: Post listings using the Wizard, review views metrics, and manage subscriptions.
- **Broker**: Verify leads logs, toggle Featured property tags, and view the Gold verified badge.
- **Admin**: Approve pending verifications, inspect flagged lists, and audit users.

---

## 📱 Progressive Web App (PWA) Support
The project comes pre-configured with a Web App Manifest in `public/manifest.json`. To enable offline caches and installation support:
1. Register a service worker in `layout.tsx` or using a next-pwa compiler.
2. Users on Chrome/Android and Safari/iOS will see an "Install App" button to use Ghar Foundation standalone.
