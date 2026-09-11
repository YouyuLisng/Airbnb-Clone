import getCurrentUser from '@/app/actions/getCurrentUser';
import { NextResponse } from "next/server";
import prisma from '@/app/libs/prismadb'

interface IdParams {
    gearId?: string
}

export async function POST(
    request: Request,
    { params } : { params: Promise<IdParams> }
) {
    const currentUser = await getCurrentUser();

    if(!currentUser) {
        return NextResponse.error();
    }

    const { gearId } = await params;

    if(!gearId || typeof gearId !== 'string') {
        throw new Error("Invalid ID");

    }

    const gear = await prisma.gear.findUnique({ where: { id: gearId } });

    if (gear?.userId === currentUser.id) {
        return NextResponse.json(
            { error: '不能收藏自己上架的裝備' },
            { status: 400 }
        );
    }

    let favoriteIds = [...(currentUser.favoriteIds || [] )];

    favoriteIds.push(gearId);

    const user = await prisma.user.update({
        where: {
            id: currentUser.id
        },
        data: {
            favoriteIds
        }
    });

    return NextResponse.json(user);
};

export async function DELETE (
    request: Request,
    { params } : { params: Promise<IdParams> }
) {
    const currentUser = await getCurrentUser();

    if(!currentUser) {
        return NextResponse.error();
    }

    const { gearId } = await params;

    if(!gearId || typeof gearId !== 'string') {
        throw new Error("Invalid ID");
    }

    let favoriteIds = [...(currentUser.favoriteIds || [] )];

    favoriteIds = favoriteIds.filter((id) => id !== gearId);

    const user = await prisma.user.update({
        where: {
            id: currentUser.id
        },
        data: {
            favoriteIds
        }
    });

    return NextResponse.json(user);
}
