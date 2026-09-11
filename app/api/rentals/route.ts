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

  const body = await request.json();
  const {
    gearId,
    startDate,
    endDate,
    totalPrice
  } = body;

  if (!gearId || !startDate || !endDate || !totalPrice) {
    return NextResponse.error();
  }

  const gearAndRental = await prisma.gear.update({
    where: {
      id: gearId
    },
    data: {
      rentals: {
        create: {
          userId: currentUser.id,
          startDate,
          endDate,
          totalPrice,
        }
      }
    }
  });

  return NextResponse.json(gearAndRental);
}
