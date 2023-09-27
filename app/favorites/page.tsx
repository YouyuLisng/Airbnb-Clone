import EmptyState from "../components/EmptyState";
import ClientOnly from "../components/ClientOnly";

import getCurrentUser from "../actions/getCurrentUser";
import getFavoritesListing from "../actions/getFavoriteListing";
import FavoritesCliect from "./FavoritesCliect";

const favoritesPage = async () => {
    const currentUser = await getCurrentUser();
    const listing = await getFavoritesListing();
    if(!currentUser) {
        return(
            <ClientOnly>
                <EmptyState 
                    title="Unauthorized"
                    subtitle="請登入"
                />
            </ClientOnly>
        )
    }

    if(listing.length === 0) {
        <ClientOnly>
            <EmptyState
                title="No favorites found"
                subtitle="Looks like you have no reservations on your properties."
            />
        </ClientOnly>
    }
    return (
        <ClientOnly>
            <FavoritesCliect 
                listing={listing}
                currentUser={currentUser}
            />
        </ClientOnly>
    );
}

export default favoritesPage;