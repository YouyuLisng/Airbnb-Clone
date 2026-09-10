import { Prisma } from '@prisma/client';

import prisma from '@/app/libs/prismadb';

// TypeScript 定義型別
export interface IGearParams {
    userId?: string;
    startDate?: string;
    endDate?: string;
    locationValue?: string;
    category?: string;
}

export default async function getGear(
    params: IGearParams
) {
    try {
        const {
            userId,
            startDate,
            endDate,
            locationValue,
            category
        } = params;

        const query: Prisma.GearWhereInput = {};

        if(userId) {
            query.userId = userId;
        }

        if(category) {
            query.category = category;
        }

        if (locationValue) {
            query.locationValue = locationValue;
        }

        if (startDate && endDate) {
            query.NOT = {
                rentals: {
                    some: {
                        OR: [
                            {
                                endDate: { gte: startDate },
                                startDate: { lte: startDate }
                            },
                            {
                                startDate: { lte: endDate },
                                endDate: { gte: endDate }
                            }
                        ]
                    }
                }
            }
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
