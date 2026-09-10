import { Prisma } from '@prisma/client';

import prisma from '@/app/libs/prismadb';

// TypeScript 定義型別
export interface IGearParams {
    userId?: string;
    keyword?: string;
    category?: string;
}

export default async function getGear(
    params: IGearParams
) {
    try {
        const {
            userId,
            keyword,
            category
        } = params;

        const query: Prisma.GearWhereInput = {};

        if(userId) {
            query.userId = userId;
        }

        if(category) {
            query.category = category;
        }

        if (keyword) {
            query.OR = [
                { title: { contains: keyword, mode: 'insensitive' } },
                { description: { contains: keyword, mode: 'insensitive' } },
            ];
        }

        const gear = await prisma.gear.findMany({
            where: query,
            orderBy: {
                createdAt: 'desc'
            }
        });

        const safeGear = gear.map((item) => ({
            ...item,
            createdAt: item.createdAt.toISOString()
        }));
        return safeGear;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
