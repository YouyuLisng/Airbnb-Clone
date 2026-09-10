"use client";

import { useCallback } from "react";

import Button from "../Button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/app/components/ui/dialog";

interface ModalProps {
    isOpen?: boolean;
    onClose: () => void;
    onSubmit: () => void;
    title?: string;
    body?: React.ReactElement;
    footer?: React.ReactElement;
    actionLabel: string;
    disabled?: boolean;
    secondaryAction?: () => void;
    secondaryActionLabel?: string;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    title,
    body,
    actionLabel,
    footer,
    disabled,
    secondaryAction,
    secondaryActionLabel
}) => {
    const handleOpenChange = useCallback((open: boolean) => {
        if (!open && !disabled) {
            onClose();
        }
    }, [onClose, disabled]);

    const handleSubmit = useCallback(() => {
        if (disabled) {
            return;
        }

        onSubmit();
    }, [onSubmit, disabled]);

    const handleSecondaryAction = useCallback(() => {
        if (disabled || !secondaryAction) {
            return;
        }

        secondaryAction();
    }, [secondaryAction, disabled]);

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent
                className="w-full md:w-4/6 lg:w-3/6 xl:w-2/5 max-w-none p-0 gap-0 overflow-hidden"
                onPointerDownOutside={(e) => disabled && e.preventDefault()}
                onEscapeKeyDown={(e) => disabled && e.preventDefault()}
            >
                {title && (
                    <DialogHeader className="p-6 border-b text-center sm:text-center">
                        <DialogTitle className="text-lg font-semibold text-center">
                            {title}
                        </DialogTitle>
                    </DialogHeader>
                )}
                <div className="relative p-6">
                    {body}
                </div>
                <DialogFooter className="flex flex-col gap-2 p-6 pt-0 sm:flex-col">
                    <div className="flex flex-row items-center gap-4 w-full">
                        {secondaryAction && secondaryActionLabel && (
                            <Button
                                disabled={disabled}
                                label={secondaryActionLabel}
                                onClick={handleSecondaryAction}
                                outline
                            />
                        )}
                        <Button disabled={disabled} onClick={handleSubmit} label={actionLabel} />
                    </div>
                    {footer}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default Modal;
