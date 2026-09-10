"use client";

import { SafeUser } from "@/app/types";
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai'
import useFavorite from "../hooks/useFavorites";

interface HeartButtonProps {
    gearId: string,
    currentUser?: SafeUser | null
}

const HeartButton: React.FC<HeartButtonProps> = ({
    gearId,
    currentUser
}) => {
    const { hasFavorited, toggleFavorite } = useFavorite({
        gearId,
        currentUser
    });
    return (
        <div
            onClick={toggleFavorite}
            className="relative hover:opacity-80 transition cursor-pointer"
        >
            <AiOutlineHeart
                size={28}
                className="absolute fill-white -top-[2px] -right-[2px]"
            />
            <AiFillHeart
                size={24}
                className={
                    hasFavorited ? 'fill-emerald-600' : 'fill-neutral-500/70'
                }
            />
        </div>
    );
}

export default HeartButton;
