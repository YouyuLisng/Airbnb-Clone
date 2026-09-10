"use client";

import Container from "../components/Container";
import GearCard from "../components/Gear/GearCard";
import Heading from "../components/Navbar/Heading";
import { SafeGear, SafeUser } from "../types";


interface FavoritesClientProps {
    gear: SafeGear[],
    currentUser?: SafeUser | null
}

const FavoritesClient: React.FC<FavoritesClientProps> = ({
    gear,
    currentUser
}) => {
    return (
        <Container>
            <Heading
                title="我的收藏"
                subtitle="這裡是我收藏的裝備清單"
            />
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2  md:grid-cols-3  lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
                {gear.map((item) => (
                    <GearCard
                        key={item.id}
                        data={item}
                        currentUser={currentUser}
                    />
                ))}
            </div>
        </Container>
    );
}

export default FavoritesClient;
