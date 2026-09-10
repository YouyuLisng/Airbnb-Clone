
import EmptyState from "@/app/components/EmptyState";
import ClientOnly from "@/app/components/ClientOnly";

import getCurrentUser from "@/app/actions/getCurrentUser";
import getFavoriteGear from "@/app/actions/getFavoriteGear";

import FavoritesClient from "./FavoritesClient";

const FavoritesPage = async () => {
    const gear = await getFavoriteGear();
    const currentUser = await getCurrentUser();

    if (gear.length === 0) {
        return (
            <ClientOnly>
                <EmptyState
                title="目前您沒有任何收藏喔"
                subtitle="趕快去尋找您喜歡的裝備吧！"
                />
            </ClientOnly>
        );
    }

    return (
        <ClientOnly>
            <FavoritesClient
                gear={gear}
                currentUser={currentUser}
            />
        </ClientOnly>
    );
}

export default FavoritesPage;
