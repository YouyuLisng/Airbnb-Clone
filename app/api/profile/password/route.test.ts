// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';

import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';
import { PATCH } from './route';

vi.mock('@/app/actions/getCurrentUser');

vi.mock('@/app/libs/prismadb', () => ({
    default: {
        user: { findUnique: vi.fn(), update: vi.fn() },
    },
}));

const mockGetCurrentUser = getCurrentUser as unknown as ReturnType<typeof vi.fn>;
const mockFindUnique = prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>;
const mockUpdate = prisma.user.update as unknown as ReturnType<typeof vi.fn>;

function makeRequest(body: unknown) {
    return new Request('http://localhost/api/profile/password', {
        method: 'PATCH',
        body: JSON.stringify(body),
    });
}

describe('PATCH /api/profile/password', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
        mockUpdate.mockResolvedValue({});
    });

    it('rejects a new password shorter than 8 characters', async () => {
        const res = await PATCH(makeRequest({ currentPassword: 'oldpass1', newPassword: 'short' }));

        expect(res.status).toBe(400);
        expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('requires currentPassword when the account already has one', async () => {
        mockFindUnique.mockResolvedValue({ id: 'user-1', hashedPassword: await bcrypt.hash('oldpass1', 12) });

        const res = await PATCH(makeRequest({ newPassword: 'newpassword1' }));

        expect(res.status).toBe(400);
        expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('rejects an incorrect current password', async () => {
        mockFindUnique.mockResolvedValue({ id: 'user-1', hashedPassword: await bcrypt.hash('oldpass1', 12) });

        const res = await PATCH(makeRequest({ currentPassword: 'wrongpass', newPassword: 'newpassword1' }));

        expect(res.status).toBe(400);
        expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('updates the password when the current one is correct', async () => {
        mockFindUnique.mockResolvedValue({ id: 'user-1', hashedPassword: await bcrypt.hash('oldpass1', 12) });

        const res = await PATCH(makeRequest({ currentPassword: 'oldpass1', newPassword: 'newpassword1' }));

        expect(res.status).toBe(200);
        expect(mockUpdate).toHaveBeenCalledWith({
            where: { id: 'user-1' },
            data: { hashedPassword: expect.any(String) },
        });
    });

    it('lets an OAuth-only account (no existing hashedPassword) set one without a current password', async () => {
        mockFindUnique.mockResolvedValue({ id: 'user-1', hashedPassword: null });

        const res = await PATCH(makeRequest({ newPassword: 'newpassword1' }));

        expect(res.status).toBe(200);
        expect(mockUpdate).toHaveBeenCalled();
    });
});
