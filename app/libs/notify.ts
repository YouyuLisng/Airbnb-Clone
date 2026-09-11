import prisma from "@/app/libs/prismadb";
import { sendEmail } from "@/app/libs/email";

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
// should never fail that primary action, so both the in-app row and
// the email are wrapped in their own try/catch instead of letting a
// caller's await throw.
export async function notify({ userId, type, title, body, link }: NotifyParams) {
    try {
        await prisma.notification.create({
            data: { userId, type, title, body, link },
        });
    } catch (error) {
        console.error("Failed to create notification", error);
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true },
        });

        if (!user?.email) {
            return;
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
        const linkHtml = link
            ? `<p><a href="${baseUrl ? baseUrl + link : link}">前往查看</a></p>`
            : "";

        await sendEmail({
            to: user.email,
            subject: `[GearShare] ${title}`,
            html: `<p>Hi ${user.name || ""}，</p><p>${body}</p>${linkHtml}`,
        });
    } catch (error) {
        console.error("Failed to send notification email", error);
    }
}
