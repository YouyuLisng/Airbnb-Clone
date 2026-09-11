import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { notify } from "@/app/libs/notify";

interface IParams {
    rentalId?: string;
}

async function getParticipantRental(rentalId: string, userId: string) {
    const rental = await prisma.rental.findUnique({
        where: { id: rentalId },
        include: { gear: true },
    });

    const isParticipant = rental && (
        rental.userId === userId ||
        rental.gear.userId === userId
    );

    return isParticipant ? rental : null;
}

export async function GET(
    request: Request,
    { params }: { params: Promise<IParams> }
) {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return NextResponse.error();
    }

    const { rentalId } = await params;

    if (!rentalId || typeof rentalId !== "string") {
        return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const rental = await getParticipantRental(rentalId, currentUser.id);

    if (!rental) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const messages = await prisma.message.findMany({
        where: { rentalId },
        include: { sender: true },
        orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
        messages: messages.map((message) => ({
            id: message.id,
            rentalId: message.rentalId,
            senderId: message.senderId,
            body: message.body,
            createdAt: message.createdAt.toISOString(),
            sender: {
                id: message.sender.id,
                name: message.sender.name,
                image: message.sender.image,
            },
        })),
    });
}

export async function POST(
    request: Request,
    { params }: { params: Promise<IParams> }
) {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return NextResponse.error();
    }

    const { rentalId } = await params;

    if (!rentalId || typeof rentalId !== "string") {
        return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const { body: messageBody } = body;

    if (!messageBody || typeof messageBody !== "string" || !messageBody.trim()) {
        return NextResponse.json(
            { error: "Missing required field: body" },
            { status: 400 }
        );
    }

    const rental = await getParticipantRental(rentalId, currentUser.id);

    if (!rental) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const message = await prisma.message.create({
        data: {
            rentalId,
            senderId: currentUser.id,
            body: messageBody.trim(),
        },
    });

    const senderIsRenter = rental.userId === currentUser.id;
    const recipientId = senderIsRenter ? rental.gear.userId : rental.userId;

    await notify({
        userId: recipientId,
        type: "message",
        title: "有新訊息",
        body: `${currentUser.name || '對方'}：${message.body.slice(0, 30)}`,
        // The recipient is whichever side the sender isn't -- point them
        // at the list page where THEY would find this rental (the
        // gear owner manages bookings from /lending, the renter from
        // /renting).
        link: senderIsRenter ? "/lending" : "/renting",
    });

    return NextResponse.json(message);
}
