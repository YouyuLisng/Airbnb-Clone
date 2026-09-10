"use client";
import { useRouter } from "next/navigation";

const Logo = () => {
    const router = useRouter();
    return(
        <div
            onClick={() => router.push('/')}
            className="hidden md:block cursor-pointer text-2xl font-bold text-emerald-700"
        >
            GearShare
        </div>
    )
};

export default Logo;
