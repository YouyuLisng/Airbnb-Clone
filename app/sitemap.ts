import { MetadataRoute } from 'next';

import prisma from '@/app/libs/prismadb';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

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
