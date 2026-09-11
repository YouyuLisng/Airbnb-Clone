"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { format } from "date-fns";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/app/components/ui/dialog";
import { Textarea } from "@/app/components/ui/textarea";
import Button from "../Button";
import Avatar from "../Avatar";
import useMessages from "@/app/hooks/useMessages";
import { SafeUser } from "@/app/types";
import { cn } from "@/app/libs/utils";

interface MessageThreadModalProps {
    rentalId: string;
    gearTitle: string;
    isOpen: boolean;
    onClose: () => void;
    currentUser: SafeUser;
}

const MessageThreadModal: React.FC<MessageThreadModalProps> = ({
    rentalId,
    gearTitle,
    isOpen,
    onClose,
    currentUser
}) => {
    const { messages, mutate } = useMessages({ rentalId: isOpen ? rentalId : null });
    const [body, setBody] = useState("");
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    }, [messages.length]);

    const onSend = useCallback(() => {
        if (!body.trim()) {
            return;
        }

        setIsSending(true);

        axios.post(`/api/rentals/${rentalId}/messages`, { body })
            .then(() => {
                setBody("");
                mutate();
            })
            .catch(() => {
                toast.error('Something went wrong.');
            })
            .finally(() => {
                setIsSending(false);
            });
    }, [body, rentalId, mutate]);

    const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    }, [onSend]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="flex h-[70vh] w-full flex-col md:w-3/6 xl:w-2/5 max-w-none p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-4 border-b text-left sm:text-left">
                    <DialogTitle className="text-base font-semibold">
                        {gearTitle}
                    </DialogTitle>
                </DialogHeader>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                    {messages.length === 0 ? (
                        <div className="m-auto text-sm text-muted-foreground">
                            還沒有訊息，開始對話吧！
                        </div>
                    ) : (
                        messages.map((message) => {
                            const isMine = message.senderId === currentUser.id;

                            return (
                                <div
                                    key={message.id}
                                    className={cn(
                                        "flex flex-row items-end gap-2",
                                        isMine && "flex-row-reverse"
                                    )}
                                >
                                    <Avatar src={message.sender.image} name={message.sender.name} />
                                    <div className={cn("flex flex-col gap-0.5", isMine && "items-end")}>
                                        <div
                                            className={cn(
                                                "rounded-2xl px-3 py-2 text-sm max-w-xs break-words",
                                                isMine
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted text-foreground"
                                            )}
                                        >
                                            {message.body}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground">
                                            {format(new Date(message.createdAt), 'p')}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
                <div className="flex flex-row items-end gap-2 border-t p-3">
                    <Textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="輸入訊息...（Enter 送出，Shift+Enter 換行）"
                        disabled={isSending}
                        rows={1}
                        className="flex-1 resize-none"
                    />
                    <div className="w-20">
                        <Button
                            small
                            label="送出"
                            disabled={isSending || !body.trim()}
                            onClick={onSend}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default MessageThreadModal;
