import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

// Deliberately narrow: only name/image are editable here. Email is tied
// to auth (and to OAuth-provider accounts for social logins) and
// password changes need their own current-password-verified flow, so
// neither belongs in this simple profile-edit endpoint.
export async function PATCH(request: Request) {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return NextResponse.error();
    }

    const body = await request.json();
    const { name, image } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
        return NextResponse.json(
            { error: "Missing required field: name" },
            { status: 400 }
        );
    }

    const user = await prisma.user.update({
        where: { id: currentUser.id },
        data: {
            name: name.trim(),
            image: typeof image === "string" && image ? image : null,
        },
    });

    return NextResponse.json(user);
}
