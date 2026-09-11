import EmptyState from "../components/EmptyState";
import ClientOnly from "../components/ClientOnly";

import getCurrentUser from "../actions/getCurrentUser";
import getGear from "../actions/getGear";
import MyGearClient from "./MyGearClient";

const MyGearPage = async () => {
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

    const { gear } = await getGear({
        userId: currentUser.id
    });

    if(gear.length === 0) {
        return (
            <ClientOnly>
                <EmptyState
                    title="目前您沒有上架裝備"
                    subtitle="趕快上架您的裝備吧！"
                />
            </ClientOnly>
        )
    }

    return(
        <ClientOnly>
            <MyGearClient
                gear={gear}
                currentUser={currentUser}
            />
        </ClientOnly>
    )
}

export default MyGearPage;
