import { MetadataRoute } from 'next';

import prisma from '@/app/libs/prismadb';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Computed per-request rather than prerendered at build time: gear
// listings change constantly, so a sitemap frozen at deploy time would
// go stale immediately. This also sidesteps needing a live DB
// connection during the build itself (CI's MongoDB service starts
// after the build step, and a from-scratch Vercel build has no
// guarantee the DB is reachable at build time either).
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const gear = await prisma.gear.findMany({
        select: { id: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
    });

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...gear.map((item) => ({
            url: `${baseUrl}/gear/${item.id}`,
            lastModified: item.createdAt,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        })),
    ];
}
