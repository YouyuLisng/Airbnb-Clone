[![CI](https://github.com/YouyuLisng/Airbnb-Clone/actions/workflows/ci.yml/badge.svg)](https://github.com/YouyuLisng/Airbnb-Clone/actions/workflows/ci.yml)

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

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

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
