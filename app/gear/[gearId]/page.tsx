

import getCurrentUser from "@/app/actions/getCurrentUser";
import getGearById from "@/app/actions/getGearById";
import ClientOnly from "@/app/components/ClientOnly";
import EmptyState from "@/app/components/EmptyState";
import GearClient from "./GearClient";
import getRentals from "@/app/actions/getRentals";

interface IParams {
    gearId?: string
}

const GearPage = async ({ params }: { params: Promise<IParams> }) => {
    const resolvedParams = await params;
    const gear = await getGearById(resolvedParams);
    const currentUser = await getCurrentUser();
    const rentals = await getRentals(resolvedParams);

    if(!gear) {
        return (
            <ClientOnly>
                <EmptyState />
            </ClientOnly>
        )
    }
    return (
        <ClientOnly>
            <GearClient
                gear={gear}
                rentals={rentals}
                currentUser={currentUser}
            />
        </ClientOnly>
    );
}

export default GearPage;
