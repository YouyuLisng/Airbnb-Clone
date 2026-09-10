import { NextResponse } from "next/server";

import prisma from "@/app/libs/prismadb";

// LINE Pay redirects here if the user backs out of the checkout page
// without paying. Nothing was ever charged -- just mark the pending
// Payment record so it doesn't linger as "pending" forever.
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (orderId) {
        const payment = await prisma.payment.findUnique({ where: { orderId } });

        if (payment && payment.status === "pending") {
            await prisma.payment.update({
                where: { id: payment.id },
                data: { status: "cancelled" },
            });

            return NextResponse.redirect(
                new URL(`/gear/${payment.gearId}?payment=cancelled`, request.url)
            );
        }
    }

    return NextResponse.redirect(new URL("/renting?payment=cancelled", request.url));
}
