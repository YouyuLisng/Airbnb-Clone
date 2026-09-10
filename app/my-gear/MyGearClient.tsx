'use client';

import { SafeGear, SafeUser } from "@/app/types";
import Container from "../components/Container";
import GearCard from "../components/Gear/GearCard";
import Heading from "../components/Navbar/Heading";
import useDeleteAction from "../hooks/useDeleteAction";

interface MyGearClientProps {
    gear: SafeGear[],
    currentUser?: SafeUser | null,
}

const MyGearClient: React.FC<MyGearClientProps> = ({
    gear,
    currentUser
}) => {
    const { deletingId, onDelete } = useDeleteAction(
        '/api/gear',
        '裝備已下架'
    );

    return (
        <Container>
            <Heading
                title="我出租的裝備"
                subtitle="你上架的裝備列表..."
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
            {gear.map((item) => (
                <GearCard
                    key={item.id}
                    data={item}
                    actionId={item.id}
                    onAction={onDelete}
                    disabled={deletingId === item.id}
                    actionLabel="下架"
                    currentUser={currentUser}
                />
            ))}
        </div>
        </Container>
    );
    }

export default MyGearClient;
