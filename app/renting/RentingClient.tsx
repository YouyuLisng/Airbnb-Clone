"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import Container from "../components/Container";
import GearCard from "../components/Gear/GearCard";
import ReviewFormModal from "../components/Gear/ReviewFormModal";
import MessageThreadModal from "../components/Gear/MessageThreadModal";
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
    const [messagingRentalId, setMessagingRentalId] = useState<string | null>(null);

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
            if (!rental.review && rental.status !== 'cancelled' && new Date(rental.endDate) < now) {
                ids.add(rental.id);
            }
        });

        return ids;
    }, [rentals]);

    // Mirrors the server-side guard in app/api/rentals/[rentalId]/route.ts:
    // only a still-confirmed rental that hasn't started yet can be
    // cancelled.
    const cancellableIds = useMemo(() => {
        const now = new Date();
        const ids = new Set<string>();

        rentals.forEach((rental) => {
            if (rental.status !== 'cancelled' && new Date(rental.startDate) > now) {
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
                        onAction={cancellableIds.has(rental.id) ? onCancel : undefined}
                        disabled={deletingId === rental.id}
                        actionLabel={cancellableIds.has(rental.id) ? "取消租借" : undefined}
                        statusBadge={rental.status === 'cancelled' ? '已取消' : undefined}
                        secondaryActionLabel={
                            reviewEligibleIds.has(rental.id) ? "留下評價" : undefined
                        }
                        onSecondaryAction={
                            reviewEligibleIds.has(rental.id)
                                ? setReviewingRentalId
                                : undefined
                        }
                        onMessage={setMessagingRentalId}
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
            {messagingRentalId && currentUser && (
                <MessageThreadModal
                    rentalId={messagingRentalId}
                    gearTitle={rentals.find((r) => r.id === messagingRentalId)?.gear.title ?? ''}
                    isOpen={!!messagingRentalId}
                    onClose={() => setMessagingRentalId(null)}
                    currentUser={currentUser}
                />
            )}
        </Container>
    );
}

export default RentingClient;
