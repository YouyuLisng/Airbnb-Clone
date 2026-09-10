

import getCurrentUser from "@/app/actions/getCurrentUser";
import getListingById from "@/app/actions/getListingById";
import ClientOnly from "@/app/components/ClientOnly";
import EmptyState from "@/app/components/EmptyState";
import ListingClient from "./ListingClient";
import getReservations from "@/app/actions/getReservations";

interface IParams {
    listingId?: string
}

const ListingPage = async ({ params }: { params: Promise<IParams> }) => {
    const resolvedParams = await params;
    const listing = await getListingById(resolvedParams);
    const currentUser = await getCurrentUser();
    const reservation = await getReservations(resolvedParams);

    if(!listing) {
        return (
            <ClientOnly>
                <EmptyState />
            </ClientOnly>
        )
    }
    return (
        <ClientOnly>
            <ListingClient 
                listing={listing}
                reservations={reservation}
                currentUser={currentUser}
            />
        </ClientOnly>
    );
}

export default ListingPage;