"use client";

import { IconType } from "react-icons";

import { cn } from "@/app/libs/utils";

interface CategoryInputProps {
    icon: IconType
    selected?: boolean,
    label: string,
    onClick: (value: string) => void,
}

const CategoryInput: React.FC<CategoryInputProps> = ({
    icon: Icon,
    onClick,
    selected,
    label,
}) => {
    return (
        <button
            type="button"
            onClick={() => onClick(label)}
            className={cn(
                "flex w-full flex-col gap-3 rounded-xl border-2 p-4 text-left outline-none transition hover:border-primary focus-visible:ring-2 focus-visible:ring-ring",
                selected ? "border-primary text-primary" : "border-border"
            )}
        >
            <Icon size={30} />
            <div className="font-semibold">
                {label}
            </div>
        </button>
    );
}

export default CategoryInput;
