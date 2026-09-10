import { NextResponse } from "next/server";

import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(
    request: Request, 
    ) {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return NextResponse.error();
    }

    const body = await request.json(); // 前端送來的值
    const { 
        title,
        description,
        imageSrc,
        category,
        roomCount,
        bathroomCount,
        guestCount,
        location,
        price,
    } = body;

    for (const key of Object.keys(body)) {
        if (!body[key]) {
            return NextResponse.json(
                { error: `Missing required field: ${key}` },
                { status: 400 }
            );
        }
    }

    const listing = await prisma.listing.create({
        data: {
        title,
        description,
        imageSrc,
        category,
        roomCount,
        bathroomCount,
        guestCount,
        locationValue: location.value,
        price: parseInt(price, 10),
        userId: currentUser.id
        }
    });

    return NextResponse.json(listing);
}