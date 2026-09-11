// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

import prisma from '@/app/libs/prismadb';
import { sendEmail } from '@/app/libs/email';
import { notify } from './notify';

vi.mock('@/app/libs/prismadb', () => ({
    default: {
        notification: { create: vi.fn() },
        user: { findUnique: vi.fn() },
    },
}));

vi.mock('@/app/libs/email', () => ({
    sendEmail: vi.fn(),
}));

const mockCreateNotification = prisma.notification.create as unknown as ReturnType<typeof vi.fn>;
const mockFindUniqueUser = prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>;
const mockSendEmail = sendEmail as unknown as ReturnType<typeof vi.fn>;

describe('notify', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCreateNotification.mockResolvedValue({});
        mockFindUniqueUser.mockResolvedValue({ email: 'user@example.com', name: 'User' });
        delete process.env.NEXT_PUBLIC_BASE_URL;
    });

    it('creates the in-app notification', async () => {
        await notify({ userId: 'user-1', type: 'message', title: 'Title', body: 'Body', link: '/renting' });

        expect(mockCreateNotification).toHaveBeenCalledWith({
            data: { userId: 'user-1', type: 'message', title: 'Title', body: 'Body', link: '/renting' },
        });
    });

    it('also emails the user with an absolute link when NEXT_PUBLIC_BASE_URL is set', async () => {
        process.env.NEXT_PUBLIC_BASE_URL = 'https://gearshare.example';

        await notify({ userId: 'user-1', type: 'message', title: 'Title', body: 'Body', link: '/renting' });

        expect(mockSendEmail).toHaveBeenCalledWith({
            to: 'user@example.com',
            subject: '[GearShare] Title',
            html: expect.stringContaining('https://gearshare.example/renting'),
        });
    });

    it('falls back to a relative link when NEXT_PUBLIC_BASE_URL is not set', async () => {
        await notify({ userId: 'user-1', type: 'message', title: 'Title', body: 'Body', link: '/renting' });

        expect(mockSendEmail).toHaveBeenCalledWith(
            expect.objectContaining({ html: expect.stringContaining('href="/renting"') })
        );
    });

    it('skips the email (but still creates the notification) when the user has no email', async () => {
        mockFindUniqueUser.mockResolvedValue({ email: null, name: 'User' });

        await notify({ userId: 'user-1', type: 'message', title: 'Title', body: 'Body' });

        expect(mockCreateNotification).toHaveBeenCalled();
        expect(mockSendEmail).not.toHaveBeenCalled();
    });

    it('does not throw when notification.create fails, and still attempts the email', async () => {
        mockCreateNotification.mockRejectedValue(new Error('DB down'));

        await expect(notify({ userId: 'user-1', type: 'message', title: 'Title', body: 'Body' })).resolves.toBeUndefined();
        expect(mockSendEmail).toHaveBeenCalled();
    });

    it('does not throw when the email lookup/send fails', async () => {
        mockFindUniqueUser.mockRejectedValue(new Error('DB down'));

        await expect(notify({ userId: 'user-1', type: 'message', title: 'Title', body: 'Body' })).resolves.toBeUndefined();
        expect(mockCreateNotification).toHaveBeenCalled();
    });
});
