import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { notify } from "@/app/libs/notify";

export async function POST(request: Request) {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return NextResponse.error();
    }

    const body = await request.json();
    const { rentalId, rating, comment } = body;

    if (!rentalId || typeof rentalId !== "string") {
        return NextResponse.json({ error: "Missing required field: rentalId" }, { status: 400 });
    }

    const ratingNumber = Number(rating);

    if (!Number.isInteger(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
        return NextResponse.json({ error: "rating must be an integer between 1 and 5" }, { status: 400 });
    }

    if (!comment || typeof comment !== "string" || !comment.trim()) {
        return NextResponse.json({ error: "Missing required field: comment" }, { status: 400 });
    }

    const rental = await prisma.rental.findUnique({
        where: { id: rentalId },
        include: { review: true, gear: true },
    });

    if (!rental || rental.userId !== currentUser.id) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (rental.endDate > new Date()) {
        return NextResponse.json(
            { error: "Rental has not ended yet" },
            { status: 400 }
        );
    }

    if (rental.review) {
        return NextResponse.json(
            { error: "This rental has already been reviewed" },
            { status: 409 }
        );
    }

    const review = await prisma.review.create({
        data: {
            rentalId,
            gearId: rental.gearId,
            userId: currentUser.id,
            rating: ratingNumber,
            comment: comment.trim(),
        },
    });

    await notify({
        userId: rental.gear.userId,
        type: "review_received",
        title: "收到新評價",
        body: `「${rental.gear.title}」收到了一則新評價`,
        link: `/gear/${rental.gearId}`,
    });

    return NextResponse.json(review);
}
