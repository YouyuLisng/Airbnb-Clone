"use client";

import { useCallback } from "react";
import axios from "axios";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhTW } from "date-fns/locale";
import { useRouter } from "next/navigation";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/app/components/ui/dropdown-menu";
import useNotifications, { SafeNotification } from "@/app/hooks/useNotifications";
import { cn } from "@/app/libs/utils";

const NotificationBell = () => {
    const router = useRouter();
    const { notifications, unreadCount, mutate } = useNotifications();

    const onSelect = useCallback((notification: SafeNotification) => {
        if (!notification.read) {
            axios.patch(`/api/notifications/${notification.id}`).then(() => mutate());
        }

        if (notification.link) {
            router.push(notification.link);
        }
    }, [router, mutate]);

    const onMarkAllRead = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        axios.patch('/api/notifications').then(() => mutate());
    }, [mutate]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="relative block rounded-full border-0 bg-transparent p-2 outline-none transition hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-ring">
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex flex-row items-center justify-between px-1.5 py-1">
                    <DropdownMenuLabel className="p-0 font-normal text-neutral-500">
                        通知
                    </DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={onMarkAllRead}
                            className="text-xs text-primary hover:underline"
                        >
                            全部標記為已讀
                        </button>
                    )}
                </div>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                    <div className="px-1.5 py-6 text-center text-sm text-muted-foreground">
                        沒有通知
                    </div>
                ) : (
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                onClick={() => onSelect(notification)}
                                className="flex flex-col items-start gap-0.5 whitespace-normal"
                            >
                                <div className="flex flex-row items-center gap-1.5 w-full">
                                    {!notification.read && (
                                        <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                                    )}
                                    <span className={cn("font-semibold", notification.read && "font-normal text-neutral-500")}>
                                        {notification.title}
                                    </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {notification.body}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: zhTW })}
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default NotificationBell;
