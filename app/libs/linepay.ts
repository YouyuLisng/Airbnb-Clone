import crypto from "crypto";

// LINE Pay's v3 API authenticates every request with a per-request HMAC
// signature (channelSecret + uri + body + nonce), not a static bearer
// token -- see https://pay-doc.line.me/en/.
//
// Read per-call rather than cached in a module-level const: this module
// is imported once and reused across requests/tests, so a cached value
// would freeze in whatever LINE_PAY_ENV happened to be set at first
// import instead of reflecting the actual current value.
function getBaseUrl() {
    return process.env.LINE_PAY_ENV === "production"
        ? "https://api-pay.line.me"
        : "https://sandbox-api-pay.line.me";
}

function getCredentials() {
    const channelId = process.env.LINE_PAY_CHANNEL_ID;
    const channelSecret = process.env.LINE_PAY_CHANNEL_SECRET;

    if (!channelId || !channelSecret) {
        throw new Error(
            "LINE_PAY_CHANNEL_ID / LINE_PAY_CHANNEL_SECRET are not configured"
        );
    }

    return { channelId, channelSecret };
}

function buildHeaders(channelId: string, channelSecret: string, uri: string, body: string) {
    const nonce = crypto.randomUUID();
    const signature = crypto
        .createHmac("sha256", channelSecret)
        .update(channelSecret + uri + body + nonce)
        .digest("base64");

    return {
        "Content-Type": "application/json",
        "X-LINE-ChannelId": channelId,
        "X-LINE-Authorization-Nonce": nonce,
        "X-LINE-Authorization": signature,
    };
}

export interface LinePayProduct {
    name: string;
    quantity: number;
    price: number;
}

export interface LinePayRequestPayload {
    amount: number;
    currency: string;
    orderId: string;
    packages: {
        id: string;
        amount: number;
        products: LinePayProduct[];
    }[];
    redirectUrls: {
        confirmUrl: string;
        cancelUrl: string;
    };
}

export interface LinePayRequestResponse {
    returnCode: string;
    returnMessage: string;
    info?: {
        paymentUrl: { web: string; app: string };
        transactionId: number;
    };
}

export interface LinePayConfirmResponse {
    returnCode: string;
    returnMessage: string;
    info?: {
        transactionId: number;
        payInfo: { method: string; amount: number }[];
    };
}

export async function requestPayment(
    payload: LinePayRequestPayload
): Promise<LinePayRequestResponse> {
    const { channelId, channelSecret } = getCredentials();
    const uri = "/v3/payments/request";
    const body = JSON.stringify(payload);

    const res = await fetch(`${getBaseUrl()}${uri}`, {
        method: "POST",
        headers: buildHeaders(channelId, channelSecret, uri, body),
        body,
    });

    return res.json();
}

export async function confirmPayment(
    transactionId: string,
    payload: { amount: number; currency: string }
): Promise<LinePayConfirmResponse> {
    const { channelId, channelSecret } = getCredentials();
    const uri = `/v3/payments/${transactionId}/confirm`;
    const body = JSON.stringify(payload);

    const res = await fetch(`${getBaseUrl()}${uri}`, {
        method: "POST",
        headers: buildHeaders(channelId, channelSecret, uri, body),
        body,
    });

    return res.json();
}
