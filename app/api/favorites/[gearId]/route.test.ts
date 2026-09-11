// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';
import { POST } from './route';

vi.mock('@/app/actions/getCurrentUser');

vi.mock('@/app/libs/prismadb', () => ({
    default: {
        gear: { findUnique: vi.fn() },
        user: { update: vi.fn() },
    },
}));

const mockGetCurrentUser = getCurrentUser as unknown as ReturnType<typeof vi.fn>;
const mockFindUniqueGear = prisma.gear.findUnique as unknown as ReturnType<typeof vi.fn>;
const mockUpdateUser = prisma.user.update as unknown as ReturnType<typeof vi.fn>;

function makeRequest() {
    return new Request('http://localhost/api/favorites/gear-1', { method: 'POST' });
}

function makeParams(gearId: string) {
    return { params: Promise.resolve({ gearId }) };
}

describe('POST /api/favorites/[gearId]', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1', favoriteIds: [] });
        mockUpdateUser.mockResolvedValue({ id: 'user-1', favoriteIds: ['gear-1'] });
    });

    it('rejects favoriting gear the current user owns themselves', async () => {
        mockFindUniqueGear.mockResolvedValue({ id: 'gear-1', userId: 'user-1' });

        const res = await POST(makeRequest(), makeParams('gear-1'));

        expect(res.status).toBe(400);
        expect(mockUpdateUser).not.toHaveBeenCalled();
    });

    it('allows favoriting gear owned by someone else', async () => {
        mockFindUniqueGear.mockResolvedValue({ id: 'gear-1', userId: 'someone-else' });

        const res = await POST(makeRequest(), makeParams('gear-1'));

        expect(res.status).toBe(200);
        expect(mockUpdateUser).toHaveBeenCalledWith({
            where: { id: 'user-1' },
            data: { favoriteIds: ['gear-1'] },
        });
    });
});
