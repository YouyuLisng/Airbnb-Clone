import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

const MIN_PASSWORD_LENGTH = 8;

export async function PATCH(request: Request) {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return NextResponse.error();
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < MIN_PASSWORD_LENGTH) {
        return NextResponse.json(
            { error: `新密碼至少需要 ${MIN_PASSWORD_LENGTH} 個字元` },
            { status: 400 }
        );
    }

    // Re-fetch from the DB rather than trusting whatever hashedPassword
    // the client might have (SafeUser doesn't strip it, but nothing
    // client-supplied should ever be trusted for an auth check).
    const user = await prisma.user.findUnique({ where: { id: currentUser.id } });

    if (!user) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // OAuth-only accounts (Google/GitHub) have no hashedPassword yet --
    // let them set one for the first time without proving a "current"
    // password that never existed. Anyone who already has one must
    // prove they know it first.
    if (user.hashedPassword) {
        if (!currentPassword || typeof currentPassword !== "string") {
            return NextResponse.json(
                { error: "Missing required field: currentPassword" },
                { status: 400 }
            );
        }

        const isCorrectPassword = await bcrypt.compare(currentPassword, user.hashedPassword);

        if (!isCorrectPassword) {
            return NextResponse.json(
                { error: "目前密碼不正確" },
                { status: 400 }
            );
        }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
        where: { id: currentUser.id },
        data: { hashedPassword },
    });

    return NextResponse.json({ success: true });
}
