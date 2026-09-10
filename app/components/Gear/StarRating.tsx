"use client";

import { Star } from "lucide-react";

import { cn } from "@/app/libs/utils";

interface StarRatingProps {
    value: number;
    onChange?: (value: number) => void;
    size?: number;
    className?: string;
}

// Doubles as both a read-only rating display (no onChange) and an
// interactive 1-5 picker (with onChange) so the review list and the
// review form can share one component.
const StarRating: React.FC<StarRatingProps> = ({
    value,
    onChange,
    size = 20,
    className
}) => {
    const interactive = !!onChange;

    return (
        <div className={cn("flex flex-row items-center gap-0.5", className)}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    tabIndex={interactive ? 0 : -1}
                    onClick={() => onChange?.(star)}
                    className={interactive ? "cursor-pointer" : "cursor-default"}
                    aria-label={`${star} 星`}
                >
                    <Star
                        size={size}
                        className={
                            star <= Math.round(value)
                                ? "fill-amber-400 text-amber-400"
                                : "fill-none text-neutral-300"
                        }
                    />
                </button>
            ))}
        </div>
    );
}

export default StarRating;
