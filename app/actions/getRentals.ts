import { Prisma } from "@prisma/client";

import prisma from "@/app/libs/prismadb";

interface IParams {
    gearId?: string;
    userId?: string;
    authorId?: string;
}

export default async function getRentals(
    params: IParams
) {
    try {
        const { gearId, userId, authorId } = params;

        const query: Prisma.RentalWhereInput = {};

        if (gearId) {
            query.gearId = gearId;
        };

        if (userId) {
            query.userId = userId;
        }

        if (authorId) {
            query.gear = { userId: authorId };
        }

        const rentals = await prisma.rental.findMany({
            where: query,
            include: {
                gear: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const safeRentals = rentals.map(
            (rental) => ({
                ...rental,
                createdAt: rental.createdAt.toISOString(),
                startDate: rental.startDate.toISOString(),
                endDate: rental.endDate.toISOString(),
                gear: {
                    ...rental.gear,
                    createdAt: rental.gear.createdAt.toISOString(),
            },
        }));

        return safeRentals;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
