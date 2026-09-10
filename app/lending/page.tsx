import EmptyState from "../components/EmptyState";
import ClientOnly from "../components/ClientOnly";

import getCurrentUser from "../actions/getCurrentUser";
import getRentals from "../actions/getRentals";
import LendingClient from "./LendingClient";

const LendingPage = async () => {
    const currentUser = await getCurrentUser();

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

    const rentals = await getRentals({
        authorId: currentUser.id
    });

    if (rentals.length === 0) {
        return (
            <ClientOnly>
                <EmptyState
                    title="目前沒有人租借您的裝備"
                    subtitle="多多補充裝備資訊或圖片來吸引承租者吧！"
                />
            </ClientOnly>
        );
    }
    return (
        <ClientOnly>
            <LendingClient
                rentals={rentals}
                currentUser={currentUser}
            />
        </ClientOnly>
    )
}

export default LendingPage;
