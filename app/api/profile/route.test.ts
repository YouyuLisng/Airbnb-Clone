// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';
import { PATCH } from './route';

vi.mock('@/app/actions/getCurrentUser');

vi.mock('@/app/libs/prismadb', () => ({
    default: {
        user: { update: vi.fn() },
    },
}));

const mockGetCurrentUser = getCurrentUser as unknown as ReturnType<typeof vi.fn>;
const mockUpdateUser = prisma.user.update as unknown as ReturnType<typeof vi.fn>;

function makeRequest(body: unknown) {
    return new Request('http://localhost/api/profile', {
        method: 'PATCH',
        body: JSON.stringify(body),
    });
}

describe('PATCH /api/profile', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
        mockUpdateUser.mockResolvedValue({ id: 'user-1', name: 'New Name', image: null });
    });

    it('does not update when not logged in', async () => {
        mockGetCurrentUser.mockResolvedValue(null);

        await PATCH(makeRequest({ name: 'New Name' }));

        expect(mockUpdateUser).not.toHaveBeenCalled();
    });

    it('rejects a missing or blank name', async () => {
        const res = await PATCH(makeRequest({ name: '   ' }));

        expect(res.status).toBe(400);
        expect(mockUpdateUser).not.toHaveBeenCalled();
    });

    it('updates name and image, trimming the name', async () => {
        const res = await PATCH(makeRequest({ name: '  New Name  ', image: 'https://example.com/a.png' }));

        expect(res.status).toBe(200);
        expect(mockUpdateUser).toHaveBeenCalledWith({
            where: { id: 'user-1' },
            data: { name: 'New Name', image: 'https://example.com/a.png' },
        });
    });

    it('clears the image when none is provided', async () => {
        await PATCH(makeRequest({ name: 'New Name' }));

        expect(mockUpdateUser).toHaveBeenCalledWith({
            where: { id: 'user-1' },
            data: { name: 'New Name', image: null },
        });
    });
});
