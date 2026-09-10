"use client";

import { IconType } from "react-icons";

import { Button as ShadcnButton } from "@/app/components/ui/button";
import { cn } from "@/app/libs/utils";

interface ButtonProps {
    label: string;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    outline?: boolean;
    small?: boolean;
    icon?: IconType;
}

// Thin wrapper around shadcn's Button that keeps this app's existing
// label/outline/small/icon prop shape, so the ~6 call sites across the
// modals and Gear/* components didn't need to change -- only the
// implementation underneath moved to shadcn.
const Button: React.FC<ButtonProps> = ({
    label,
    onClick,
    disabled,
    outline,
    small,
    icon: Icon
}) => {
    return (
        <ShadcnButton
            onClick={onClick}
            disabled={disabled}
            variant={outline ? "outline" : "default"}
            size={small ? "sm" : "lg"}
            className={cn("w-full", small ? "font-light" : "font-semibold")}
        >
            {Icon && <Icon size={20} />}
            {label}
        </ShadcnButton>
    );
}

export default Button;
