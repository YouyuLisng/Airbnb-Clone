// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';

import { requestPayment, confirmPayment } from './linepay';

const originalFetch = global.fetch;

describe('linepay', () => {
    beforeEach(() => {
        process.env.LINE_PAY_CHANNEL_ID = 'test-channel-id';
        process.env.LINE_PAY_CHANNEL_SECRET = 'test-channel-secret';
        delete process.env.LINE_PAY_ENV;
        global.fetch = vi.fn().mockResolvedValue({
            json: () => Promise.resolve({ returnCode: '0000' }),
        }) as unknown as typeof fetch;
    });

    afterEach(() => {
        global.fetch = originalFetch;
        delete process.env.LINE_PAY_CHANNEL_ID;
        delete process.env.LINE_PAY_CHANNEL_SECRET;
        delete process.env.LINE_PAY_ENV;
    });

    it('throws instead of calling LINE Pay when channel credentials are not configured', async () => {
        delete process.env.LINE_PAY_CHANNEL_ID;

        await expect(requestPayment({
            amount: 100,
            currency: 'TWD',
            orderId: 'order-1',
            packages: [],
            redirectUrls: { confirmUrl: 'https://x/confirm', cancelUrl: 'https://x/cancel' },
        })).rejects.toThrow(/not configured/);

        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('signs the request with a correct HMAC-SHA256 signature and hits the sandbox host', async () => {
        const payload = {
            amount: 500,
            currency: 'TWD',
            orderId: 'order-1',
            packages: [],
            redirectUrls: { confirmUrl: 'https://x/confirm', cancelUrl: 'https://x/cancel' },
        };

        await requestPayment(payload);

        expect(global.fetch).toHaveBeenCalledTimes(1);
        const [url, init] = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];

        expect(url).toBe('https://sandbox-api-pay.line.me/v3/payments/request');
        expect(init.method).toBe('POST');
        expect(init.headers['X-LINE-ChannelId']).toBe('test-channel-id');

        const nonce = init.headers['X-LINE-Authorization-Nonce'];
        const expectedSignature = crypto
            .createHmac('sha256', 'test-channel-secret')
            .update('test-channel-secret' + '/v3/payments/request' + init.body + nonce)
            .digest('base64');

        expect(init.headers['X-LINE-Authorization']).toBe(expectedSignature);
    });

    it('uses the production host when LINE_PAY_ENV=production', async () => {
        process.env.LINE_PAY_ENV = 'production';

        await confirmPayment('txn-1', { amount: 500, currency: 'TWD' });

        const [url] = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
        expect(url).toBe('https://api-pay.line.me/v3/payments/txn-1/confirm');
    });

    it('defaults to the sandbox host when LINE_PAY_ENV is unset', async () => {
        await confirmPayment('txn-1', { amount: 500, currency: 'TWD' });

        const [url] = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
        expect(url).toBe('https://sandbox-api-pay.line.me/v3/payments/txn-1/confirm');
    });
});
