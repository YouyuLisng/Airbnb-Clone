import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

interface IParams {
    notificationId?: string;
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<IParams> }
) {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return NextResponse.error();
    }

    const { notificationId } = await params;

    if (!notificationId || typeof notificationId !== "string") {
        return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
    });

    if (!notification || notification.userId !== currentUser.id) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
    });

    return NextResponse.json(updated);
}
