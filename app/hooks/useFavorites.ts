import axios from "axios";
import { useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";

import { SafeUser } from "@/app/types";

import useCurrentUser from "./useCurrentUser";
import useLoginModal from "./useLoginModal";

interface IUseFavorite {
    gearId: string;
    currentUser?: SafeUser | null
}

const useFavorite = ({ gearId, currentUser: fallbackCurrentUser }: IUseFavorite) => {
    const loginModal = useLoginModal();

    // SWR-backed current user, seeded with the server-fetched value so the
    // first paint has no loading state. Mutations below update this cache
    // directly (optimistic UI) instead of forcing a full router.refresh().
    const { data: currentUser, mutate: mutateCurrentUser } = useCurrentUser({
        fallbackData: fallbackCurrentUser,
    });

    const hasFavorited = useMemo(() => {
        const list = currentUser?.favoriteIds || [];

        return list.includes(gearId);
    }, [currentUser, gearId]);

    const toggleFavorite = useCallback(async (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();

        if (!currentUser) {
            return loginModal.onOpen();
        }

        const nextFavoriteIds = hasFavorited
            ? (currentUser.favoriteIds || []).filter((id) => id !== gearId)
            : [...(currentUser.favoriteIds || []), gearId];

        try {
            const request = hasFavorited
                ? () => axios.delete(`/api/favorites/${gearId}`)
                : () => axios.post(`/api/favorites/${gearId}`);

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
            const message = axios.isAxiosError(error)
                ? error.response?.data?.error
                : undefined;

            toast.error(message || 'Something went wrong.');
        }
    },
    [
        currentUser,
        hasFavorited,
        gearId,
        loginModal,
        mutateCurrentUser,
    ]);

    return {
        hasFavorited,
        toggleFavorite,
    }
}

export default useFavorite;
