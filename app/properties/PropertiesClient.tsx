'use client';

import { SafeListing, SafeUser } from "@/app/types";
import Container from "../components/Container";
import ListingCard from "../components/Listings/ListingCard";
import Heading from "../components/Navbar/Heading";
import useDeleteAction from "../hooks/useDeleteAction";

interface PropertiesClientProps {
    listings: SafeListing[],
    currentUser?: SafeUser | null,
}

const PropertiesClient: React.FC<PropertiesClientProps> = ({
    listings,
    currentUser
}) => {
    const { deletingId, onDelete } = useDeleteAction(
        '/api/listings',
        'Listing deleted'
    );

    return (
        <Container>
            <Heading
                title="我的房源"
                subtitle="你的房源列表..."
            />
        <div 
            className="
                mt-10
                grid 
                grid-cols-1 
                sm:grid-cols-2 
                md:grid-cols-3 
                lg:grid-cols-4
                xl:grid-cols-5
                2xl:grid-cols-6
                gap-8
                "
        >
            {listings.map((listing) => (
                <ListingCard
                    key={listing.id}
                    data={listing}
                    actionId={listing.id}
                    onAction={onDelete}
                    disabled={deletingId === listing.id}
                    actionLabel="移除"
                    currentUser={currentUser}
                />
            ))}
        </div>
        </Container>
    );
    }

export default PropertiesClient;