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
        condition,
        location,
        depositAmount,
        pricePerDay,
    } = body;

    // Validated against the known required field names, not
    // Object.keys(body): iterating the request body's own keys only
    // catches fields that are present-but-falsy, not fields the client
    // omitted entirely.
    const requiredFields = [
        'title',
        'description',
        'imageSrc',
        'category',
        'condition',
        'location',
        'depositAmount',
        'pricePerDay',
    ] as const;

    for (const key of requiredFields) {
        if (!body[key]) {
            return NextResponse.json(
                { error: `Missing required field: ${key}` },
                { status: 400 }
            );
        }
    }

    const gear = await prisma.gear.create({
        data: {
        title,
        description,
        imageSrc,
        category,
        condition,
        locationValue: location.value,
        depositAmount: parseInt(depositAmount, 10),
        pricePerDay: parseInt(pricePerDay, 10),
        userId: currentUser.id
        }
    });

    return NextResponse.json(gear);
}
