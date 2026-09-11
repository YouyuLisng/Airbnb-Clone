"use client";

import { useState } from "react";
import useRegions from "@/app/hooks/useRegions";
import { SafeUser } from "@/app/types";
import Image from "next/image";
import Heading from "../Navbar/Heading";
import HeartButton from "../HeartButton";
import { cn } from "@/app/libs/utils";

interface GearHeadProps {
    title: string;
    locationValue: string;
    imageSrc: string;
    imageSrcs?: string[];
    id: string;
    ownerId: string;
    currentUser?: SafeUser | null
}

const GearHead: React.FC<GearHeadProps> = ({
    title,
    locationValue,
    imageSrc,
    imageSrcs = [],
    id,
    ownerId,
    currentUser
}) => {
    const { getByValue } = useRegions();
    const location = getByValue(locationValue);

    // The cover photo (imageSrc) is always the first thumbnail too, so
    // clicking it re-selects itself -- simpler than special-casing "the
    // active photo that isn't in the gallery array".
    const allPhotos = [imageSrc, ...imageSrcs];
    const [activePhoto, setActivePhoto] = useState(imageSrc);

    return (
        <>
            <Heading
                title={title}
                subtitle={`${location?.label} · ${location?.region}`}
            />
            <div className="w-full h-[60vh] overflow-hidden rounded-xl relative">
                <Image
                    alt="Image"
                    src={activePhoto}
                    fill
                    className="object-cover w-full"
                />
                {currentUser?.id !== ownerId && (
                    <div className="absolute top-5 right-5">
                        <HeartButton
                            gearId={id}
                            currentUser={currentUser}
                        />
                    </div>
                )}
            </div>
            {allPhotos.length > 1 && (
                <div className="flex flex-row gap-3 overflow-x-auto">
                    {allPhotos.map((photo, index) => (
                        <button
                            key={`${photo}-${index}`}
                            type="button"
                            onClick={() => setActivePhoto(photo)}
                            className={cn(
                                "relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 outline-none transition",
                                activePhoto === photo ? "border-primary" : "border-transparent hover:border-border"
                            )}
                        >
                            <Image
                                alt={`${title} ${index + 1}`}
                                src={photo}
                                fill
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </>
    );
}

export default GearHead;
