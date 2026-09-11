"use client";
import {
    FieldErrors,
    FieldValues,
    UseFormRegister
} from "react-hook-form";
import { BiDollar } from "react-icons/bi";

import { Input as ShadcnInput } from "@/app/components/ui/input";
import { cn } from "@/app/libs/utils";

interface InputProps {
    id: string;
    label: string;
    type?: string;
    disabled?: boolean;
    formatPrice?: boolean;
    required?: boolean;
    register: UseFormRegister<FieldValues>,
    errors: FieldErrors
}

// Wraps shadcn's Input to keep this app's floating-label layout (label
// sits inside the field at rest, floats up on focus/when filled via the
// peer-* classes below) -- shadcn's own Input has no such variant, and
// the floating label is an established, already-branded piece of UI
// here, not tutorial leftovers, so it's kept rather than replaced with
// shadcn's standalone Label-above-field convention.
const Input:React.FC<InputProps> = ({
    id,
    label,
    type,
    disabled,
    formatPrice,
    required,
    register,
    errors
}) => {
    const hasError = !!errors[id];

    return (
        <div className="w-full relative">
            {formatPrice &&(
                <BiDollar
                size={24}
                className="
                    text-neutral-700
                    absolute
                    top-5
                    left-2
                    z-10"
                />
            )}
            <ShadcnInput
                autoCorrect="off"
                autoComplete="off"
                id={id}
                disabled={disabled}
                {...register(id, {required})}
                placeholder=" "
                type={type}
                aria-invalid={hasError}
                className={cn(
                    "peer h-auto w-full rounded-md border-2 p-4 pt-6 font-light",
                    "focus-visible:ring-0 aria-invalid:ring-0",
                    formatPrice ? "pl-9" : "pl-4",
                    hasError
                        ? "border-destructive focus-visible:border-destructive aria-invalid:border-destructive"
                        : "border-neutral-300 focus-visible:border-black"
                )}
            />
            <label
                className={cn(
                    "absolute text-md duration-150 transform -translate-y-3 top-5 z-10 origin-[0]",
                    formatPrice ? "left-9" : "left-4",
                    "peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4",
                    hasError ? "text-destructive" : "text-zinc-400"
                )}
            >
                {label}
            </label>
        </div>
    );
}

export default Input;
