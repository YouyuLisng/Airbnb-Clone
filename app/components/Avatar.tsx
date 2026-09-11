'use client';

import { UserRound } from "lucide-react";

import {
    Avatar as ShadcnAvatar,
    AvatarFallback,
    AvatarImage
} from "@/app/components/ui/avatar";

interface AvatarProps {
    src?: string | null;
    name?: string | null;
}

// Falls back to the user's initial (or a generic icon, if no name is
// known) instead of a static placeholder image -- Radix's Avatar
// primitive already handles showing the fallback while the image is
// loading or if it fails, so there's no broken-image risk either.
const Avatar: React.FC<AvatarProps> = ({ src, name }) => {
    const initial = name?.trim()?.[0]?.toUpperCase();

    return (
        <ShadcnAvatar className="size-[30px]">
            {src && <AvatarImage src={src} alt={name || 'Avatar'} />}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {initial || <UserRound size={16} />}
            </AvatarFallback>
        </ShadcnAvatar>
    );
}

export default Avatar;
