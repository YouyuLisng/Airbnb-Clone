// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';
import { GET, PATCH } from './route';

vi.mock('@/app/actions/getCurrentUser');

vi.mock('@/app/libs/prismadb', () => ({
    default: {
        notification: {
            findMany: vi.fn(),
            count: vi.fn(),
            updateMany: vi.fn(),
        },
    },
}));

const mockGetCurrentUser = getCurrentUser as unknown as ReturnType<typeof vi.fn>;
const mockFindMany = prisma.notification.findMany as unknown as ReturnType<typeof vi.fn>;
const mockCount = prisma.notification.count as unknown as ReturnType<typeof vi.fn>;
const mockUpdateMany = prisma.notification.updateMany as unknown as ReturnType<typeof vi.fn>;

describe('GET /api/notifications', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
        mockFindMany.mockResolvedValue([]);
        mockCount.mockResolvedValue(0);
    });

    it('scopes the query to the current user, most recent first', async () => {
        await GET();

        expect(mockFindMany).toHaveBeenCalledWith({
            where: { userId: 'user-1' },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        expect(mockCount).toHaveBeenCalledWith({
            where: { userId: 'user-1', read: false },
        });
    });

    it('converts createdAt to an ISO string and includes unreadCount', async () => {
        const createdAt = new Date('2026-01-01T00:00:00.000Z');
        mockFindMany.mockResolvedValue([{ id: 'n-1', createdAt }]);
        mockCount.mockResolvedValue(3);

        const res = await GET();
        const body = await res.json();

        expect(body.notifications[0].createdAt).toBe(createdAt.toISOString());
        expect(body.unreadCount).toBe(3);
    });
});

describe('PATCH /api/notifications (mark all read)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
    });

    it('marks every unread notification for the current user as read', async () => {
        const res = await PATCH();

        expect(res.status).toBe(200);
        expect(mockUpdateMany).toHaveBeenCalledWith({
            where: { userId: 'user-1', read: false },
            data: { read: true },
        });
    });
});
