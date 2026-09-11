import { Prisma } from '@prisma/client';

import prisma from '@/app/libs/prismadb';
import { SafeGear } from '@/app/types';

// TypeScript 定義型別
export interface IGearParams {
    userId?: string;
    keyword?: string;
    category?: string;
    page?: number;
}

export const GEAR_PAGE_SIZE = 12;

export interface GetGearResult {
    gear: SafeGear[];
    totalPages: number;
    page: number;
}

export default async function getGear(
    params: IGearParams
): Promise<GetGearResult> {
    try {
        const {
            userId,
            keyword,
            category,
            page
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

        // Pagination is opt-in via `page` -- callers that don't pass it
        // (e.g. my-gear's "list everything I own" view) keep the old
        // unlimited behavior instead of silently being capped at
        // GEAR_PAGE_SIZE.
        const currentPage = page && page > 0 ? page : undefined;

        const [gear, totalCount] = await Promise.all([
            prisma.gear.findMany({
                where: query,
                orderBy: {
                    createdAt: 'desc'
                },
                ...(currentPage ? {
                    skip: (currentPage - 1) * GEAR_PAGE_SIZE,
                    take: GEAR_PAGE_SIZE,
                } : {}),
            }),
            currentPage ? prisma.gear.count({ where: query }) : Promise.resolve(null),
        ]);

        const safeGear = gear.map((item) => ({
            ...item,
            createdAt: item.createdAt.toISOString()
        }));

        return {
            gear: safeGear,
            totalPages: currentPage
                ? Math.max(1, Math.ceil((totalCount ?? 0) / GEAR_PAGE_SIZE))
                : 1,
            page: currentPage ?? 1,
        };
    } catch (error) {
        console.error(error);
        throw error;
    }
}
