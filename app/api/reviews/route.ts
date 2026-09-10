import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

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
        include: { review: true },
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

    return NextResponse.json(review);
}
