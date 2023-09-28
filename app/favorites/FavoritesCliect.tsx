"use client";

import { useRouter } from "next/navigation";
import Container from "../components/Container";
import ListingCard from "../components/Listings/ListingCard";
import Heading from "../components/Navbar/Heading";
import { SafeListing, SafeUser } from "../types";
import { useCallback, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";


interface FavoritesClientProps {
    listings: SafeListing[],
    currentUser?: SafeUser | null
}

const FavoritesClient: React.FC<FavoritesClientProps> = ({
    listings,
    currentUser
}) => {
    return (
        <Container>
            <Heading
                title="我的收藏"
                subtitle="這裡是我的喜愛清單"
            />
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2  md:grid-cols-3  lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
                {listings.map((listing: any) => (
                    <ListingCard
                        key={listing.id}
                        data={listing}
                        currentUser={currentUser}
                    />
                ))}
            </div>
        </Container>
    );
}

export default FavoritesClient;