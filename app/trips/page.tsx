
import EmptyState from "../components/EmptyState";
import ClientOnly from "../components/ClientOnly";

import getCurrentUser from "../actions/getCurrentUser";
import getReservations from "../actions/getReservations";
import TripsClient from "./TripsClient";

const TripsPage = async () => {
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

    const reservations = await getReservations({
        userId: currentUser.id
    });

    if(reservations.length === 0) {
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
            <TripsClient 
                reservations={reservations}
                currentUser={currentUser}
            />
        </ClientOnly>
    )
}

export default TripsPage;