"use client";

import useRegions from "@/app/hooks/useRegions";
import { SafeUser } from "@/app/types";
import { IconType } from "react-icons";
import Avatar from "../Avatar";
import GearCategory from "./GearCategory";
import dynamic from "next/dynamic";

const Map = dynamic(() => import('../Map'), {
    ssr: false
});

interface GearInfoProps {
    user: SafeUser;
    description: string;
    condition: string;
    depositAmount: number;
    category: {
        icon: IconType;
        label: string;
        description: string;
    } | undefined
    locationValue: string
}

const GearInfo: React.FC<GearInfoProps> = ({
    user,
    description,
    condition,
    depositAmount,
    category,
    locationValue
}) => {
    const { getByValue } = useRegions();

    const coordinates = getByValue(locationValue)?.latlng;

    return (
        <div className=" col-span-4 flex flex-col gap-8">
            <div className="flex flex-col gap-2">
                <div className="text-xl font-semibold flex flex-row items-center gap-2">
                    <div>
                        出租者：{user?.name}
                    </div>
                    <Avatar src={user?.image} />
                </div>
                <div className=" flex flex-row items-center gap-4 font-light text-neutral-500">
                    <div>
                        新舊狀況：{condition}
                    </div>
                    <div>
                        押金：${depositAmount} TWD
                    </div>
                </div>
            </div>
            <hr />
            {category &&(
                <GearCategory
                    icon={category.icon}
                    label={category.label}
                    description={category.description}
                />
            )}
            <hr />
            <div className=" text-lg font-light text-neutral-500">
                {description}
            </div>
            <hr />
            <Map center={coordinates} />
        </div>
    );
}

export default GearInfo;
