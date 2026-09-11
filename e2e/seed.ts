// Seeds a dedicated test account + a handful of gear listings for the
// E2E suite to run against. Separate from prisma/seed.ts (which seeds
// demo data for the real owner account by email, for local dev) --
// this one creates its own throwaway user from scratch, since CI runs
// against a fresh, empty database with no pre-existing account to
// attach gear to.
//
// Only ever run directly (`node e2e/seed.ts`), never imported -- spec
// files import the plain data (E2E_TEST_USER/E2E_GEAR) from
// ./fixtures instead, precisely so importing them can't accidentally
// re-trigger this file's seeding side effect.
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Node's native ESM loader (this file is run directly via `node
// e2e/seed.ts`, not through a bundler) requires the explicit extension
// for a relative import -- unlike tsc or Playwright's own transform,
// which both resolve './fixtures' without one.
import { E2E_TEST_USER, E2E_GEAR } from './fixtures.ts';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash(E2E_TEST_USER.password, 12);

    const user = await prisma.user.upsert({
        where: { email: E2E_TEST_USER.email },
        update: { hashedPassword },
        create: {
            email: E2E_TEST_USER.email,
            name: E2E_TEST_USER.name,
            hashedPassword,
        },
    });

    // Gear has no natural unique key to upsert on, so re-running this
    // script (every CI run, or repeatedly against a shared dev DB while
    // iterating on these tests locally) would otherwise pile up
    // duplicates -- clear this user's previous E2E gear first instead.
    await prisma.gear.deleteMany({ where: { userId: user.id } });

    for (const gear of E2E_GEAR) {
        await prisma.gear.create({
            data: { ...gear, userId: user.id },
        });
    }

    console.log(`Seeded E2E test user ${user.email} with ${E2E_GEAR.length} gear listings.`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
