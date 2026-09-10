"use client";

import { SafeGear, SafeRental, SafeUser } from "@/app/types";
import { useRouter } from "next/navigation";
import useRegions from "@/app/hooks/useRegions";
import { useCallback, useMemo } from "react";
import { format } from "date-fns";
import Image from "next/image";
import HeartButton from "../HeartButton";
import Button from "../Button";


interface GearCardProps {
    data: SafeGear,
    rental?: SafeRental,
    onAction?: (id: string) => void,
    disabled?: boolean,
    actionLabel?: string,
    actionId?: string,
    secondaryActionLabel?: string,
    onSecondaryAction?: (id: string) => void,
    currentUser?: SafeUser | null
}

const GearCard: React.FC<GearCardProps> = ({
    data,
    rental,
    onAction,
    disabled,
    actionLabel,
    actionId = "",
    secondaryActionLabel,
    onSecondaryAction,
    currentUser
}) => {
    const router = useRouter();
    const { getByValue } = useRegions();

    const location = getByValue(data.locationValue);

    const handleCancel = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            if(disabled) {
                return
            }

            onAction?.(actionId)
        }, [actionId, onAction, disabled]
    );

    const handleSecondaryAction = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            if(disabled) {
                return
            }

            onSecondaryAction?.(actionId)
        }, [actionId, onSecondaryAction, disabled]
    );

    const price = useMemo(() => {
        if(rental) {
            return rental.totalPrice;
        }

        return data.pricePerDay;
    }, [rental, data.pricePerDay]);

    const rentalDate = useMemo(() => {
        if(!rental) {
            return null
        }

        const start = new Date(rental.startDate);
        const end = new Date(rental.endDate);

        return `${format(start, 'PP')} - ${format(end, 'PP')}`
    }, [rental]);

    return (
        <div
            onClick={() => router.push(`/gear/${data.id}`)}
            className="col-span-1 cursor-pointer group"
        >
            <div className="flex flex-col gap-2 w-full">
                <div className="aspect-square w-full relative overflow-hidden rounded-xl">
                    <Image
                        fill
                        alt="Gear"
                        src={data.imageSrc}
                        className="object-cover h-full w-full group-hover:scale-110 transition"
                    />
                    <div className="absolute top-3 right-3">
                        <HeartButton
                            gearId={data.id}
                            currentUser={currentUser}
                        />
                    </div>
                </div>
                <div className="font-semibold text-lg">
                    {location?.label} · {location?.region}
                </div>
                <div className="font-light text-neutral-500">
                    {rentalDate || data.category}
                </div>
                <div className="flex flex-row items-center gap-1">
                    <div className="font-semibold">
                        ${price}TWD
                    </div>
                    {!rental &&(
                        <div className="font-light">
                            天
                        </div>
                    )}
                </div>
                {onAction && actionLabel && (
                    <Button
                        disabled={disabled}
                        small
                        label={actionLabel}
                        onClick={handleCancel}
                    />
                )}
                {onSecondaryAction && secondaryActionLabel && (
                    <Button
                        disabled={disabled}
                        small
                        outline
                        label={secondaryActionLabel}
                        onClick={handleSecondaryAction}
                    />
                )}
            </div>
        </div>
    );
}

export default GearCard;
