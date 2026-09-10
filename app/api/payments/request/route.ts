import { NextResponse } from "next/server";
import crypto from "crypto";

import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { requestPayment } from "@/app/libs/linepay";

// Kicks off a LINE Pay checkout for a prospective rental. The Rental
// itself is created only once the payment is confirmed (see
// app/api/payments/confirm/route.ts) -- this route just books the
// pending Payment record and hands back the LINE Pay checkout URL for
// the client to redirect to.
export async function POST(request: Request) {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return NextResponse.error();
    }

    const body = await request.json();
    const { gearId, startDate, endDate, totalPrice } = body;

    if (!gearId || !startDate || !endDate || !totalPrice) {
        return NextResponse.json(
            { error: "Missing required field" },
            { status: 400 }
        );
    }

    const gear = await prisma.gear.findUnique({ where: { id: gearId } });

    if (!gear) {
        return NextResponse.json({ error: "Gear not found" }, { status: 404 });
    }

    const rentalFee = Math.round(Number(totalPrice));
    const depositAmount = gear.depositAmount;
    const totalAmount = rentalFee + depositAmount;
    const orderId = crypto.randomUUID();

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;

    const payment = await prisma.payment.create({
        data: {
            orderId,
            userId: currentUser.id,
            gearId,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            rentalFee,
            depositAmount,
            totalAmount,
            status: "pending",
        },
    });

    let linePayResponse;

    try {
        linePayResponse = await requestPayment({
            amount: totalAmount,
            currency: "TWD",
            orderId,
            packages: [
                {
                    id: gearId,
                    amount: totalAmount,
                    products: [
                        { name: `${gear.title}（租金）`, quantity: 1, price: rentalFee },
                        { name: "押金（歸還後退回）", quantity: 1, price: depositAmount },
                    ],
                },
            ],
            redirectUrls: {
                confirmUrl: `${baseUrl}/api/payments/confirm`,
                cancelUrl: `${baseUrl}/api/payments/cancel?orderId=${orderId}`,
            },
        });
    } catch (error) {
        await prisma.payment.update({
            where: { id: payment.id },
            data: { status: "failed" },
        });

        console.error(error);
        return NextResponse.json(
            { error: "LINE Pay is not configured. Set LINE_PAY_CHANNEL_ID / LINE_PAY_CHANNEL_SECRET." },
            { status: 500 }
        );
    }

    if (linePayResponse.returnCode !== "0000" || !linePayResponse.info) {
        await prisma.payment.update({
            where: { id: payment.id },
            data: { status: "failed" },
        });

        return NextResponse.json(
            { error: linePayResponse.returnMessage || "LINE Pay request failed" },
            { status: 502 }
        );
    }

    await prisma.payment.update({
        where: { id: payment.id },
        data: { transactionId: String(linePayResponse.info.transactionId) },
    });

    return NextResponse.json({ paymentUrl: linePayResponse.info.paymentUrl.web });
}
