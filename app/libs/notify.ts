import prisma from "@/app/libs/prismadb";

export type NotificationType =
    | "message"
    | "rental_confirmed"
    | "rental_cancelled"
    | "review_received"
    | "deposit_resolved";

interface NotifyParams {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    link?: string;
}

// A notification is always a side effect of some primary action (a
// payment confirming, a message sending, ...) -- failing to write one
// should never fail that primary action, so this swallows its own
// errors instead of letting a caller's await throw.
export async function notify({ userId, type, title, body, link }: NotifyParams) {
    try {
        await prisma.notification.create({
            data: { userId, type, title, body, link },
        });
    } catch (error) {
        console.error("Failed to create notification", error);
    }
}
