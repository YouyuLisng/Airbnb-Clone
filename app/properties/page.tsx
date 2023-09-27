
import EmptyState from "../components/EmptyState";
import ClientOnly from "../components/ClientOnly";

import getCurrentUser from "../actions/getCurrentUser";
import TripsClient from "./PropertiesClient";
import getListings from "../actions/getListings";
import PropertiesClient from "./PropertiesClient";

const PropertiesPage = async () => {
    const currentUser = await getCurrentUser();

    if(!currentUser) {
        return (
            <ClientOnly>
                <EmptyState 
                    title="Unauthorized"
                    subtitle="請登入"
                />
            </ClientOnly>
        )
    }

    const listings = await getListings({
        userId: currentUser.id
    });

    if(listings.length === 0) {
        return (
            <ClientOnly>
                <EmptyState 
                    title="沒有找到行程"
                    subtitle="尋找看看你喜歡的行程！"
                />
            </ClientOnly>
        )
    }

    return(
        <ClientOnly>
            <PropertiesClient 
                listings={listings}
                currentUser={currentUser}
            />
        </ClientOnly>
    )
}

export default PropertiesPage;