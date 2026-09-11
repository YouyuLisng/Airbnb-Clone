import useSWR from "swr";

import fetcher from "@/app/libs/fetcher";

export interface SafeMessage {
    id: string;
    rentalId: string;
    senderId: string;
    body: string;
    createdAt: string;
    sender: {
        id: string;
        name: string | null;
        image: string | null;
    };
}

interface IUseMessages {
    rentalId: string | null;
}

// Polls every 5s while a thread is open -- short enough to feel close
// to live in an active conversation, without needing websocket infra.
const useMessages = ({ rentalId }: IUseMessages) => {
    const { data, mutate, isLoading } = useSWR<{ messages: SafeMessage[] }>(
        rentalId ? `/api/rentals/${rentalId}/messages` : null,
        fetcher,
        {
            refreshInterval: 5000,
        }
    );

    return {
        messages: data?.messages ?? [],
        isLoading,
        mutate,
    };
};

export default useMessages;
