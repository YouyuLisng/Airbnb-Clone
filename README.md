[![CI](https://github.com/YouyuLisng/Airbnb-Clone/actions/workflows/ci.yml/badge.svg)](https://github.com/YouyuLisng/Airbnb-Clone/actions/workflows/ci.yml)

# GearShare

A peer-to-peer marketplace for renting outdoor gear (tents, sleeping bags,
camera equipment, and the like) directly from other people, instead of a
single shop's own inventory. Built on Next.js 16 (App Router), Prisma +
MongoDB, and next-auth.

Originally scaffolded from a well-known Airbnb-clone tutorial; the data
model, routes, and UI have since been reworked around gear rental instead
of property booking (`Gear`/`Rental` instead of `Listing`/`Reservation`,
condition tracking, a deposit lifecycle) rather than left as a re-skin.

## Core flows

- **Browse & search** gear by category, pickup region, and availability
  window (`app/page.tsx`, `SearchModal`)
- **List gear** you own for others to rent (`RentModal` → `POST /api/gear`)
- **Book a rental** for a date range; a deposit is calculated alongside the
  daily rate (`GearClient` / `RentalBox` → `POST /api/rentals`)
- **Resolve the deposit** as the lender: once gear is returned, record its
  condition and the deposit is automatically refunded or forfeited
  (`/lending` → `PATCH /api/rentals/[rentalId]`)
- **Track your gear**: what you're renting (`/renting`), what others are
  renting from you (`/lending`), what you've listed (`/my-gear`), and what
  you've saved (`/favorites`)

## Testing

```bash
npm run test        # unit tests (Vitest) -- Prisma is mocked, no DB needed
npm run test:watch  # unit tests in watch mode
npm run test:e2e    # E2E smoke tests (Playwright)
```

The E2E suite is intentionally scoped to flows that don't touch the
database: sessions use the JWT strategy, so redirect-when-unauthenticated
checks never need a real `DATABASE_URL`. That's also what lets `test:e2e`
run in CI (see `.github/workflows/ci.yml`) against dummy env vars, alongside
lint, a standalone typecheck, the unit suite, and a full production build.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see
the result. You'll need a `.env` with `DATABASE_URL` (MongoDB), NextAuth
secrets, and OAuth credentials -- see `.env.example`.
