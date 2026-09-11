import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

const RECENT_LIMIT = 20;

export async function GET() {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return NextResponse.error();
    }

    const [notifications, unreadCount] = await Promise.all([
        prisma.notification.findMany({
            where: { userId: currentUser.id },
            orderBy: { createdAt: "desc" },
            take: RECENT_LIMIT,
        }),
        prisma.notification.count({
            where: { userId: currentUser.id, read: false },
        }),
    ]);

    return NextResponse.json({
        notifications: notifications.map((n) => ({
            ...n,
            createdAt: n.createdAt.toISOString(),
        })),
        unreadCount,
    });
}

// Marks every one of the current user's unread notifications as read
// (the bell dropdown's "全部標記為已讀"). Marking a single one read
// happens on click instead, via PATCH /api/notifications/[id].
export async function PATCH() {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return NextResponse.error();
    }

    await prisma.notification.updateMany({
        where: { userId: currentUser.id, read: false },
        data: { read: true },
    });

    return NextResponse.json({ success: true });
}
