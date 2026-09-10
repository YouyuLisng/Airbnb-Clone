"use client";
import Container from "../components/Container";
import ListingCard from "../components/Listings/ListingCard";
import Heading from "../components/Navbar/Heading";

import { SafeReservation, SafeUser } from "../types";
import useDeleteAction from "../hooks/useDeleteAction";
interface ReservationClientProps {
    reservations: SafeReservation[];
    currentUser?: SafeUser | null;
}

const ReservationClient: React.FC<ReservationClientProps> = ({
    reservations,
    currentUser
}) => {
    const { deletingId, onDelete: onCancel } = useDeleteAction(
        '/api/reservations',
        'Reservations Canceled'
    );

    return (
        <Container>
            <Heading 
                title="我的訂單"
                subtitle="不要忘記你的預約訂單喔～"
            />
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2  md:grid-cols-3  lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
                {reservations.map((reservation) => (
                    <ListingCard
                        key={reservation.id}
                        data={reservation.listing}
                        reservation={reservation}
                        actionId={reservation.id}
                        onAction={onCancel}
                        disabled={deletingId === reservation.id}
                        actionLabel="取消預訂"
                        currentUser={currentUser}
                    />
                ))}
            </div>
        </Container>
    );
}

export default ReservationClient;