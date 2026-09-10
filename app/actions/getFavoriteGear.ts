import prisma from "@/app/libs/prismadb";

import getCurrentUser from "./getCurrentUser";

export default async function getFavoriteGear() {
    try {
        const currentUser = await getCurrentUser();

        if(!currentUser) {
            return []
        }

        const favorites = await prisma.gear.findMany({
            where: {
                id: {
                    in: [...(currentUser.favoriteIds || [])]
                }
            }
        });

        const safeFavorites = favorites.map((favorite) => ({
            ...favorite,
            createdAt: favorite.createdAt.toISOString(),
        }));

        return safeFavorites;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
