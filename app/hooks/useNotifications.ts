import useSWR from "swr";

import fetcher from "@/app/libs/fetcher";

export interface SafeNotification {
    id: string;
    userId: string;
    type: string;
    title: string;
    body: string;
    link: string | null;
    read: boolean;
    createdAt: string;
}

interface NotificationsResponse {
    notifications: SafeNotification[];
    unreadCount: number;
}

interface IUseNotifications {
    enabled?: boolean;
}

// Polls every 30s while enabled -- there's no websocket/push infra here,
// so this is the "close enough" live feel: new notifications show up
// within half a minute instead of only on the next full page load.
const useNotifications = ({ enabled = true }: IUseNotifications = {}) => {
    const { data, mutate, isLoading } = useSWR<NotificationsResponse>(
        enabled ? "/api/notifications" : null,
        fetcher,
        {
            refreshInterval: 30000,
            revalidateOnFocus: true,
        }
    );

    return {
        notifications: data?.notifications ?? [],
        unreadCount: data?.unreadCount ?? 0,
        isLoading,
        mutate,
    };
};

export default useNotifications;
