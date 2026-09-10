"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";

import Container from "../components/Container";
import GearCard from "../components/Gear/GearCard";
import ReviewFormModal from "../components/Gear/ReviewFormModal";
import Heading from "../components/Navbar/Heading";
import { SafeRental, SafeUser } from "../types";
import useDeleteAction from "../hooks/useDeleteAction";

interface RentingClientProps {
    rentals: SafeRental[];
    currentUser?: SafeUser | null;
}

const RentingClient: React.FC<RentingClientProps> = ({
    rentals,
    currentUser
}) => {
    const { deletingId, onDelete: onCancel } = useDeleteAction(
        '/api/rentals',
        '已取消租借'
    );
    const router = useRouter();
    const searchParams = useSearchParams();
    const [reviewingRentalId, setReviewingRentalId] = useState<string | null>(null);

    useEffect(() => {
        const payment = searchParams.get('payment');

        if (payment === 'success') {
            toast.success('付款成功，租借已成立！');
        } else if (payment === 'failed') {
            toast.error('付款失敗，請重新嘗試。');
        } else if (payment === 'error') {
            toast.error('付款發生問題，請稍後再試。');
        } else if (payment === 'cancelled') {
            toast('已取消付款，未完成租借', { icon: 'ℹ️' });
        }

        if (payment) {
            router.replace('/renting');
        }
    }, [searchParams, router]);

    const reviewEligibleIds = useMemo(() => {
        const now = new Date();
        const ids = new Set<string>();

        rentals.forEach((rental) => {
            if (!rental.review && new Date(rental.endDate) < now) {
                ids.add(rental.id);
            }
        });

        return ids;
    }, [rentals]);

    return (
        <Container>
            <Heading
                title="我承租的裝備"
                subtitle="這裡是你租借過的裝備紀錄"
            />
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2  md:grid-cols-3  lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
                {rentals.map((rental) => (
                    <GearCard
                        key={rental.id}
                        data={rental.gear}
                        rental={rental}
                        actionId={rental.id}
                        onAction={onCancel}
                        disabled={deletingId === rental.id}
                        actionLabel="取消租借"
                        secondaryActionLabel={
                            reviewEligibleIds.has(rental.id) ? "留下評價" : undefined
                        }
                        onSecondaryAction={
                            reviewEligibleIds.has(rental.id)
                                ? setReviewingRentalId
                                : undefined
                        }
                        currentUser={currentUser}
                    />
                ))}
            </div>
            {reviewingRentalId && (
                <ReviewFormModal
                    rentalId={reviewingRentalId}
                    isOpen={!!reviewingRentalId}
                    onClose={() => setReviewingRentalId(null)}
                />
            )}
        </Container>
    );
}

export default RentingClient;
