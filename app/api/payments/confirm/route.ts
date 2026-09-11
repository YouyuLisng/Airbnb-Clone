import { NextResponse } from "next/server";

import prisma from "@/app/libs/prismadb";
import { confirmPayment } from "@/app/libs/linepay";
import { notify } from "@/app/libs/notify";

// LINE Pay redirects the user's browser here after they approve the
// payment on LINE Pay's hosted checkout page. This finalizes the charge
// server-side and only then creates the actual Rental -- the pending
// Payment record already has every field a Rental needs.
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get("transactionId");
    const orderId = searchParams.get("orderId");

    if (!transactionId || !orderId) {
        return NextResponse.redirect(new URL("/renting?payment=error", request.url));
    }

    const payment = await prisma.payment.findUnique({ where: { orderId } });

    if (!payment || payment.status !== "pending") {
        return NextResponse.redirect(new URL("/renting?payment=error", request.url));
    }

    let confirmResponse;

    try {
        confirmResponse = await confirmPayment(transactionId, {
            amount: payment.totalAmount,
            currency: "TWD",
        });
    } catch (error) {
        console.error(error);
        await prisma.payment.update({
            where: { id: payment.id },
            data: { status: "failed" },
        });
        return NextResponse.redirect(new URL("/renting?payment=error", request.url));
    }

    if (confirmResponse.returnCode !== "0000") {
        await prisma.payment.update({
            where: { id: payment.id },
            data: { status: "failed" },
        });
        return NextResponse.redirect(new URL("/renting?payment=failed", request.url));
    }

    const rental = await prisma.rental.create({
        data: {
            userId: payment.userId,
            gearId: payment.gearId,
            startDate: payment.startDate,
            endDate: payment.endDate,
            totalPrice: payment.rentalFee,
        },
        include: { gear: true },
    });

    await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "confirmed", rentalId: rental.id },
    });

    await notify({
        userId: rental.gear.userId,
        type: "rental_confirmed",
        title: "有新的租借訂單",
        body: `你的「${rental.gear.title}」已被租借`,
        link: "/lending",
    });

    return NextResponse.redirect(new URL("/renting?payment=success", request.url));
}
