"use client";

import Container from "../components/Container";
import ListingCard from "../components/Listings/ListingCard";
import Heading from "../components/Navbar/Heading";
import { SafeReservation, SafeUser } from "../types";
import useDeleteAction from "../hooks/useDeleteAction";

interface TripsClientProps {
    reservations: SafeReservation[];
    currentUser?: SafeUser | null;
}

const TripsClient: React.FC<TripsClientProps> = ({
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
                title="旅程"
                subtitle="Where you've been and where you're going"
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

export default TripsClient;