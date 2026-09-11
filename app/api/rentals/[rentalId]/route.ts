import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

interface IParams {
    rentalId?: string;
}

// Cancels a rental -- a soft cancel (status flips to "cancelled"), not a
// hard delete. Two reasons: a completed/in-progress rental shouldn't be
// cancellable at all (see the guards below), and hard-deleting the row
// would cascade-delete its Review (rentalId is a required relation),
// silently destroying someone's review along with a booking they're
// just trying to tidy up from their history.
export async function DELETE(
    request: Request,
    { params }: { params: Promise<IParams> }
): Promise<Response> {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return NextResponse.error();
    }

    const { rentalId } = await params;

    if (!rentalId || typeof rentalId !== 'string') {
        throw new Error('Invalid ID');
    }

    const rental = await prisma.rental.findUnique({
        where: { id: rentalId },
        include: { gear: true },
    });

    const isParticipant = rental && (
        rental.userId === currentUser.id ||
        rental.gear.userId === currentUser.id
    );

    if (!rental || !isParticipant) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (rental.status === 'cancelled') {
        return NextResponse.json(
            { error: '這筆租借已經取消過了' },
            { status: 400 }
        );
    }

    if (rental.startDate <= new Date()) {
        return NextResponse.json(
            { error: '租借已經開始或結束，無法取消' },
            { status: 400 }
        );
    }

    const updated = await prisma.rental.update({
        where: { id: rentalId },
        data: { status: 'cancelled' },
    });

    return NextResponse.json(updated);
}

// Records the gear's condition at return time and resolves the deposit
// accordingly. Only the gear's owner (the lender) can do this -- it's
// their call on whether the returned item is in an acceptable state.
const REFUNDABLE_CONDITIONS = ['良好', '正常', '如新'];

export async function PATCH(
    request: Request,
    { params }: { params: Promise<IParams> }
): Promise<Response> {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return NextResponse.error();
    }

    const { rentalId } = await params;

    if (!rentalId || typeof rentalId !== 'string') {
        throw new Error('Invalid ID');
    }

    const body = await request.json();
    const { returnCondition } = body;

    if (!returnCondition || typeof returnCondition !== 'string') {
        return NextResponse.json(
            { error: 'Missing required field: returnCondition' },
            { status: 400 }
        );
    }

    const rental = await prisma.rental.findUnique({
        where: { id: rentalId },
        include: { gear: true },
    });

    if (!rental || rental.gear.userId !== currentUser.id) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (rental.status === 'cancelled') {
        return NextResponse.json(
            { error: '這筆租借已經取消，無法確認歸還' },
            { status: 400 }
        );
    }

    const depositStatus = REFUNDABLE_CONDITIONS.includes(returnCondition)
        ? 'refunded'
        : 'forfeited';

    const updated = await prisma.rental.update({
        where: { id: rentalId },
        data: { returnCondition, depositStatus },
    });

    return NextResponse.json(updated);
}
