"use client";

import useRegions from "@/app/hooks/useRegions";
import { SafeUser } from "@/app/types";
import Image from "next/image";
import Heading from "../Navbar/Heading";
import HeartButton from "../HeartButton";

interface GearHeadProps {
    title: string;
    locationValue: string;
    imageSrc: string;
    id: string;
    currentUser?: SafeUser | null
}

const GearHead: React.FC<GearHeadProps> = ({
    title,
    locationValue,
    imageSrc,
    id,
    currentUser
}) => {
    const { getByValue } = useRegions();
    const location = getByValue(locationValue);
    return (
        <>
            <Heading
                title={title}
                subtitle={`${location?.label} · ${location?.region}`}
            />
            <div className="w-full h-[60vh] overflow-hidden rounded-xl relative">
                <Image
                    alt="Image"
                    src={imageSrc}
                    fill
                    className="object-cover w-full"
                />
                <div className="absolute top-5 right-5">
                    <HeartButton
                        gearId={id}
                        currentUser={currentUser}
                    />
                </div>
            </div>
        </>
    );
}

export default GearHead;
