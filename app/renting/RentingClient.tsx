"use client";

import Container from "../components/Container";
import GearCard from "../components/Gear/GearCard";
import Heading from "../components/Navbar/Heading";
import { SafeRental, SafeUser } from "../types";
import useDeleteAction from "../hooks/useDeleteAction";

interface RentingClientProps {
    rentals: SafeRental[];
    currentUser?: SafeUser | null;
}

const RentingClient: React.FC<RentingClientProps> = ({
    rentals,
    currentUser
}) => {
    const { deletingId, onDelete: onCancel } = useDeleteAction(
        '/api/rentals',
        '已取消租借'
    );

    return (
        <Container>
            <Heading
                title="我承租的裝備"
                subtitle="這裡是你租借過的裝備紀錄"
            />
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2  md:grid-cols-3  lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
                {rentals.map((rental) => (
                    <GearCard
                        key={rental.id}
                        data={rental.gear}
                        rental={rental}
                        actionId={rental.id}
                        onAction={onCancel}
                        disabled={deletingId === rental.id}
                        actionLabel="取消租借"
                        currentUser={currentUser}
                    />
                ))}
            </div>
        </Container>
    );
}

export default RentingClient;
