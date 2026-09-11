// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { sendEmail } from './email';

const originalFetch = global.fetch;

describe('sendEmail', () => {
    beforeEach(() => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve('') }) as unknown as typeof fetch;
    });

    afterEach(() => {
        global.fetch = originalFetch;
        delete process.env.RESEND_API_KEY;
        delete process.env.RESEND_FROM_EMAIL;
    });

    it('no-ops without throwing when RESEND_API_KEY is not configured', async () => {
        delete process.env.RESEND_API_KEY;

        await sendEmail({ to: 'a@example.com', subject: 'Hi', html: '<p>hi</p>' });

        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('posts to the Resend API with the configured key and a default from address', async () => {
        process.env.RESEND_API_KEY = 'test-key';

        await sendEmail({ to: 'a@example.com', subject: 'Hi', html: '<p>hi</p>' });

        expect(global.fetch).toHaveBeenCalledWith(
            'https://api.resend.com/emails',
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({ Authorization: 'Bearer test-key' }),
            })
        );
        const [, init] = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
        const body = JSON.parse(init.body);
        expect(body).toEqual({
            from: 'GearShare <onboarding@resend.dev>',
            to: 'a@example.com',
            subject: 'Hi',
            html: '<p>hi</p>',
        });
    });

    it('uses RESEND_FROM_EMAIL when configured', async () => {
        process.env.RESEND_API_KEY = 'test-key';
        process.env.RESEND_FROM_EMAIL = 'Custom <custom@example.com>';

        await sendEmail({ to: 'a@example.com', subject: 'Hi', html: '<p>hi</p>' });

        const [, init] = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
        expect(JSON.parse(init.body).from).toBe('Custom <custom@example.com>');
    });

    it('does not throw when the Resend API responds with an error', async () => {
        process.env.RESEND_API_KEY = 'test-key';
        global.fetch = vi.fn().mockResolvedValue({ ok: false, text: () => Promise.resolve('bad request') }) as unknown as typeof fetch;

        await expect(sendEmail({ to: 'a@example.com', subject: 'Hi', html: '<p>hi</p>' })).resolves.toBeUndefined();
    });

    it('does not throw when fetch itself rejects', async () => {
        process.env.RESEND_API_KEY = 'test-key';
        global.fetch = vi.fn().mockRejectedValue(new Error('network down')) as unknown as typeof fetch;

        await expect(sendEmail({ to: 'a@example.com', subject: 'Hi', html: '<p>hi</p>' })).resolves.toBeUndefined();
    });
});
