
import prisma from '@/app/libs/prismadb';

interface IParams {
    gearId?: string;
}

export default async function getGearById(
    params: IParams
) {
    try {
        const { gearId } = params;

        const gear = await prisma.gear.findUnique({
            where: {
                id: gearId
            },
            include: {
                user: true
            }
        });

        if(!gear) {
            return null
        }

        return {
            ...gear,
            createdAt: gear.createdAt.toString(),
            user: {
                ...gear.user,
                createdAt: gear.user.createdAt.toString(),
                updatedAt: gear.user.updatedAt.toString(),
                emailVerified:
                    gear.user.emailVerified?.toString() || null,
            }
        };

    } catch (error) {
        console.error(error);
        throw error;
    }
}
