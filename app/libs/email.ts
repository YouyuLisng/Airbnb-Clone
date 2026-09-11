// Uses Resend's REST API directly via fetch rather than installing the
// `resend` package -- one endpoint, no need for a full SDK. Needs
// RESEND_API_KEY (free tier at https://resend.com); without it this
// silently no-ops so local dev/CI never need real email credentials,
// the same fallback shape LINE Pay's client uses when unconfigured.
interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        return;
    }

    try {
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: process.env.RESEND_FROM_EMAIL || "GearShare <onboarding@resend.dev>",
                to,
                subject,
                html,
            }),
        });

        if (!res.ok) {
            console.error("Failed to send email", await res.text());
        }
    } catch (error) {
        console.error("Failed to send email", error);
    }
}
