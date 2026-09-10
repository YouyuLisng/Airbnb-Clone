"use client";

import { useCallback, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

import Modal from "../Modals/Modal";
import { Textarea } from "@/app/components/ui/textarea";
import StarRating from "./StarRating";

interface ReviewFormModalProps {
    rentalId: string;
    isOpen: boolean;
    onClose: () => void;
}

const ReviewFormModal: React.FC<ReviewFormModalProps> = ({
    rentalId,
    isOpen,
    onClose
}) => {
    const router = useRouter();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = useCallback(() => {
        if (!comment.trim()) {
            toast.error('請輸入評價內容');
            return;
        }

        setIsLoading(true);

        axios.post('/api/reviews', { rentalId, rating, comment })
            .then(() => {
                toast.success('感謝你的評價！');
                setComment("");
                setRating(5);
                onClose();
                router.refresh();
            })
            .catch(() => {
                toast.error('Something went wrong.');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [rentalId, rating, comment, onClose, router]);

    const bodyContent = (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <div className="font-semibold">評分</div>
                <StarRating value={rating} onChange={setRating} size={28} />
            </div>
            <div className="flex flex-col gap-2">
                <div className="font-semibold">評價內容</div>
                <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={isLoading}
                    placeholder="分享這次租借的體驗..."
                    rows={4}
                />
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            title="留下評價"
            actionLabel="送出評價"
            disabled={isLoading}
            body={bodyContent}
        />
    );
}

export default ReviewFormModal;
