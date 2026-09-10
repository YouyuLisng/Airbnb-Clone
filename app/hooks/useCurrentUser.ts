import useSWR from "swr";

import { SafeUser } from "@/app/types";
import fetcher from "@/app/libs/fetcher";

interface IUseCurrentUser {
    fallbackData?: SafeUser | null;
}

const useCurrentUser = ({ fallbackData }: IUseCurrentUser = {}) => {
    const { data, error, isLoading, mutate } = useSWR<SafeUser | null>(
        "/api/current",
        fetcher,
        {
            fallbackData,
            revalidateOnFocus: false,
        }
    );

    return {
        data,
        error,
        isLoading,
        mutate,
    };
};

export default useCurrentUser;
