import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

interface IParams {
  gearId?: string;
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<IParams> }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const { gearId } = await params;

  if (!gearId || typeof gearId !== 'string') {
    throw new Error('Invalid ID');
  }

  const gear = await prisma.gear.deleteMany({
    where: {
      id: gearId,
      userId: currentUser.id
    }
  });

  return NextResponse.json(gear);
}
