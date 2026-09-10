import axios from "axios";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

// Shared by LendingClient, RentingClient and MyGearClient: all three
// delete a resource by id, toast the result, and refresh the current route.
const useDeleteAction = (urlPrefix: string, successMessage: string) => {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState('');

    const onDelete = useCallback((id: string) => {
        setDeletingId(id);

        axios.delete(`${urlPrefix}/${id}`)
        .then(() => {
            toast.success(successMessage);
            router.refresh();
        })
        .catch((error) => {
            toast.error(error?.response?.data?.error);
        })
        .finally(() => {
            setDeletingId('');
        });
    }, [router, urlPrefix, successMessage]);

    return { deletingId, onDelete };
};

export default useDeleteAction;
