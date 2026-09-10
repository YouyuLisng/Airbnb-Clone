import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

interface IParams {
    rentalId?: string;
}

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

    const rental = await prisma.rental.deleteMany({
        where: {
            id: rentalId,
            OR: [
                { userId: currentUser.id },
                { gear: { userId: currentUser.id } }
            ]
        }
    });

    return NextResponse.json(rental);
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

    const depositStatus = REFUNDABLE_CONDITIONS.includes(returnCondition)
        ? 'refunded'
        : 'forfeited';

    const updated = await prisma.rental.update({
        where: { id: rentalId },
        data: { returnCondition, depositStatus },
    });

    return NextResponse.json(updated);
}
