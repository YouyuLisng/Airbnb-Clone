"use client";

import { useMemo } from "react";
import { format } from "date-fns";

import { SafeReview } from "@/app/types";
import Avatar from "../Avatar";
import StarRating from "./StarRating";

interface ReviewsSectionProps {
    reviews: SafeReview[];
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews }) => {
    const average = useMemo(() => {
        if (!reviews.length) {
            return 0;
        }

        return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    }, [reviews]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-row items-center gap-2 text-lg font-semibold">
                {reviews.length > 0 ? (
                    <>
                        <StarRating value={average} size={18} />
                        <span>{average.toFixed(1)}</span>
                        <span className="text-neutral-500 font-normal">
                            （{reviews.length} 則評價）
                        </span>
                    </>
                ) : (
                    <span className="text-neutral-500 font-normal">尚無評價</span>
                )}
            </div>
            {reviews.length > 0 && (
                <div className="flex flex-col gap-4">
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            className="flex flex-col gap-1 border-b border-neutral-200 pb-4 last:border-0"
                        >
                            <div className="flex flex-row items-center gap-2">
                                <Avatar src={review.user.image} />
                                <div className="font-semibold">{review.user.name}</div>
                                <StarRating value={review.rating} size={14} />
                            </div>
                            <div className="text-neutral-500 text-sm">
                                {format(new Date(review.createdAt), 'PP')}
                            </div>
                            <div className="text-neutral-700">{review.comment}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ReviewsSection;
