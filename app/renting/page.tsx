import EmptyState from "../components/EmptyState";
import ClientOnly from "../components/ClientOnly";

import getCurrentUser from "../actions/getCurrentUser";
import getRentals from "../actions/getRentals";
import RentingClient from "./RentingClient";

const RentingPage = async () => {
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

    const rentals = await getRentals({
        userId: currentUser.id
    });

    if(rentals.length === 0) {
        return (
            <ClientOnly>
                <EmptyState
                    title="沒有找到租借紀錄"
                    subtitle="趕快去找找你需要的裝備吧！"
                />
            </ClientOnly>
        )
    }

    return(
        <ClientOnly>
            <RentingClient
                rentals={rentals}
                currentUser={currentUser}
            />
        </ClientOnly>
    )
}

export default RentingPage;
