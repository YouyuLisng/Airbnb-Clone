// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';
import { PATCH } from './route';

vi.mock('@/app/actions/getCurrentUser');

vi.mock('@/app/libs/prismadb', () => ({
    default: {
        notification: { findUnique: vi.fn(), update: vi.fn() },
    },
}));

const mockGetCurrentUser = getCurrentUser as unknown as ReturnType<typeof vi.fn>;
const mockFindUnique = prisma.notification.findUnique as unknown as ReturnType<typeof vi.fn>;
const mockUpdate = prisma.notification.update as unknown as ReturnType<typeof vi.fn>;

function makeParams() {
    return { params: Promise.resolve({ notificationId: 'notification-1' }) };
}

describe('PATCH /api/notifications/[notificationId]', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
        mockFindUnique.mockResolvedValue({ id: 'notification-1', userId: 'user-1' });
        mockUpdate.mockResolvedValue({ id: 'notification-1', read: true });
    });

    it('marks the notification read when it belongs to the current user', async () => {
        const res = await PATCH(new Request('http://localhost'), makeParams());

        expect(res.status).toBe(200);
        expect(mockUpdate).toHaveBeenCalledWith({
            where: { id: 'notification-1' },
            data: { read: true },
        });
    });

    it("rejects marking someone else's notification read", async () => {
        mockFindUnique.mockResolvedValue({ id: 'notification-1', userId: 'someone-else' });

        const res = await PATCH(new Request('http://localhost'), makeParams());

        expect(res.status).toBe(404);
        expect(mockUpdate).not.toHaveBeenCalled();
    });
});
