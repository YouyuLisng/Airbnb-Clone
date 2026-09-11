"use client";
import { useState } from "react";

import Container from "../components/Container";
import RentalReturnCard from "../components/Gear/RentalReturnCard";
import MessageThreadModal from "../components/Gear/MessageThreadModal";
import Heading from "../components/Navbar/Heading";

import { SafeRental, SafeUser } from "../types";

interface LendingClientProps {
    rentals: SafeRental[];
    currentUser?: SafeUser | null;
}

const LendingClient: React.FC<LendingClientProps> = ({
    rentals,
    currentUser
}) => {
    const [messagingRentalId, setMessagingRentalId] = useState<string | null>(null);

    return (
        <Container>
            <Heading
                title="別人租借我的裝備"
                subtitle="裝備歸還後，記得確認狀況以結算押金喔～"
            />
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2  md:grid-cols-3  lg:grid-cols-4 gap-8">
                {rentals.map((rental) => (
                    <RentalReturnCard
                        key={rental.id}
                        rental={rental}
                        onMessage={setMessagingRentalId}
                    />
                ))}
            </div>
            {messagingRentalId && currentUser && (
                <MessageThreadModal
                    rentalId={messagingRentalId}
                    gearTitle={rentals.find((r) => r.id === messagingRentalId)?.gear.title ?? ''}
                    isOpen={!!messagingRentalId}
                    onClose={() => setMessagingRentalId(null)}
                    currentUser={currentUser}
                />
            )}
        </Container>
    );
}

export default LendingClient;
