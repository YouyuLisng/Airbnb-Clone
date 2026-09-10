import axios from "axios";
import { useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";

import { SafeUser } from "@/app/types";

import useCurrentUser from "./useCurrentUser";
import useLoginModal from "./useLoginModal";

interface IUseFavorite {
    listingId: string;
    currentUser?: SafeUser | null
}

const useFavorite = ({ listingId, currentUser: fallbackCurrentUser }: IUseFavorite) => {
    const loginModal = useLoginModal();

    // SWR-backed current user, seeded with the server-fetched value so the
    // first paint has no loading state. Mutations below update this cache
    // directly (optimistic UI) instead of forcing a full router.refresh().
    const { data: currentUser, mutate: mutateCurrentUser } = useCurrentUser({
        fallbackData: fallbackCurrentUser,
    });

    const hasFavorited = useMemo(() => {
        const list = currentUser?.favoriteIds || [];

        return list.includes(listingId);
    }, [currentUser, listingId]);

    const toggleFavorite = useCallback(async (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();

        if (!currentUser) {
            return loginModal.onOpen();
        }

        const nextFavoriteIds = hasFavorited
            ? (currentUser.favoriteIds || []).filter((id) => id !== listingId)
            : [...(currentUser.favoriteIds || []), listingId];

        try {
            const request = hasFavorited
                ? () => axios.delete(`/api/favorites/${listingId}`)
                : () => axios.post(`/api/favorites/${listingId}`);

            // Optimistically update the shared SWR cache, then reconcile
            // with whatever the API actually persisted.
            await mutateCurrentUser(
                async () => {
                    const { data: updatedUser } = await request();
                    return updatedUser;
                },
                {
                    optimisticData: { ...currentUser, favoriteIds: nextFavoriteIds },
                    rollbackOnError: true,
                    revalidate: false,
                }
            );
            toast.success('Success');
        } catch (error) {
            toast.error('Something went wrong.');
        }
    },
    [
        currentUser,
        hasFavorited,
        listingId,
        loginModal,
        mutateCurrentUser,
    ]);

    return {
        hasFavorited,
        toggleFavorite,
    }
}

export default useFavorite;