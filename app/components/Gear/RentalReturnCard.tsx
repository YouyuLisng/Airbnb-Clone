"use client";

import { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";

import Button from "../Button";
import { SafeRental } from "@/app/types";

// Kept in sync with REFUNDABLE_CONDITIONS in
// app/api/rentals/[rentalId]/route.ts -- only the first three refund the
// deposit, the rest forfeit it.
const RETURN_CONDITIONS = ['良好', '正常', '如新', '輕微耗損', '損壞'];

const DEPOSIT_STATUS_LABEL: Record<string, string> = {
    held: '押金已收取',
    refunded: '押金已退還',
    forfeited: '押金已沒收',
};

// held = pending (amber), refunded = good outcome (emerald),
// forfeited = bad outcome (red) -- scannable at a glance across a grid
// of cards without having to read the label text.
const DEPOSIT_STATUS_COLOR: Record<string, string> = {
    held: 'bg-amber-100 text-amber-800',
    refunded: 'bg-emerald-100 text-emerald-800',
    forfeited: 'bg-red-100 text-red-800',
};

interface RentalReturnCardProps {
    rental: SafeRental;
}

// Lets the gear owner (lender) record the item's condition when it's
// returned, which resolves the deposit: an acceptable condition refunds
// it, anything else forfeits it. This is the lending-side half of the
// deposit lifecycle -- the renter pays the deposit implicitly when the
// rental is created (see RentalBox), the lender resolves it here.
const RentalReturnCard: React.FC<RentalReturnCardProps> = ({ rental }) => {
    const router = useRouter();
    const [condition, setCondition] = useState(RETURN_CONDITIONS[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isResolved = rental.depositStatus !== 'held';

    const onSubmit = useCallback(() => {
        setIsSubmitting(true);

        axios.patch(`/api/rentals/${rental.id}`, { returnCondition: condition })
            .then(() => {
                toast.success('已完成歸還確認');
                router.refresh();
            })
            .catch(() => {
                toast.error('Something went wrong.');
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    }, [rental.id, condition, router]);

    return (
        <div className="col-span-1 border-[1px] border-neutral-200 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex flex-row gap-4">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                    <Image
                        fill
                        alt={rental.gear.title}
                        src={rental.gear.imageSrc}
                        className="object-cover"
                    />
                </div>
                <div className="flex flex-col">
                    <div className="font-semibold">{rental.gear.title}</div>
                    <div className="text-sm text-neutral-500">
                        {format(new Date(rental.startDate), 'PP')} - {format(new Date(rental.endDate), 'PP')}
                    </div>
                    <div className="text-sm text-neutral-500">
                        押金 ${rental.gear.depositAmount} TWD
                    </div>
                    <span className={`
                        mt-1 w-fit px-2 py-0.5 rounded-full text-xs font-semibold
                        ${DEPOSIT_STATUS_COLOR[rental.depositStatus]}
                    `}>
                        {DEPOSIT_STATUS_LABEL[rental.depositStatus]}
                    </span>
                </div>
            </div>
            <hr />
            {isResolved ? (
                <div className="text-sm text-neutral-500">
                    {rental.returnCondition && `歸還狀況：${rental.returnCondition}`}
                </div>
            ) : (
                <div className="flex flex-row items-center gap-2">
                    <select
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                        className="border-[1px] border-neutral-300 rounded-lg p-2 text-sm flex-1"
                        disabled={isSubmitting}
                    >
                        {RETURN_CONDITIONS.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                    <div className="w-32">
                        <Button
                            small
                            label="確認歸還"
                            disabled={isSubmitting}
                            onClick={onSubmit}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default RentalReturnCard;
