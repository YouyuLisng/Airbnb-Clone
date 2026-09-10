import { describe, it, expect, vi, beforeEach } from 'vitest';

import prisma from '@/app/libs/prismadb';
import getGear from './getGear';

vi.mock('@/app/libs/prismadb', () => ({
    default: {
        gear: {
            findMany: vi.fn(),
        },
    },
}));

const mockFindMany = prisma.gear.findMany as unknown as ReturnType<typeof vi.fn>;

describe('getGear', () => {
    beforeEach(() => {
        mockFindMany.mockReset();
        mockFindMany.mockResolvedValue([]);
    });

    it('builds an empty where-clause when no filters are given', async () => {
        await getGear({});

        expect(mockFindMany).toHaveBeenCalledWith({
            where: {},
            orderBy: { createdAt: 'desc' },
        });
    });

    it('filters by userId and category', async () => {
        await getGear({ userId: 'user-1', category: '帳篷' });

        expect(mockFindMany).toHaveBeenCalledWith({
            where: { userId: 'user-1', category: '帳篷' },
            orderBy: { createdAt: 'desc' },
        });
    });

    it('matches keyword against title or description, case-insensitively', async () => {
        await getGear({ keyword: '帳篷' });

        expect(mockFindMany).toHaveBeenCalledWith({
            where: {
                OR: [
                    { title: { contains: '帳篷', mode: 'insensitive' } },
                    { description: { contains: '帳篷', mode: 'insensitive' } },
                ],
            },
            orderBy: { createdAt: 'desc' },
        });
    });

    it('converts createdAt to an ISO string on each returned item', async () => {
        const createdAt = new Date('2026-01-01T00:00:00.000Z');
        mockFindMany.mockResolvedValue([{ id: '1', createdAt }]);

        const [item] = await getGear({});

        expect(item.createdAt).toBe(createdAt.toISOString());
    });

    it('rethrows the original error on failure instead of wrapping it', async () => {
        const original = new Error('DB down');
        mockFindMany.mockRejectedValue(original);

        await expect(getGear({})).rejects.toBe(original);
    });
});
