import { describe, it, expect, vi, beforeEach } from 'vitest';

import prisma from '@/app/libs/prismadb';
import getGear from './getGear';

vi.mock('@/app/libs/prismadb', () => ({
    default: {
        gear: {
            findMany: vi.fn(),
            count: vi.fn(),
        },
    },
}));

const mockFindMany = prisma.gear.findMany as unknown as ReturnType<typeof vi.fn>;
const mockCount = prisma.gear.count as unknown as ReturnType<typeof vi.fn>;

describe('getGear', () => {
    beforeEach(() => {
        mockFindMany.mockReset();
        mockCount.mockReset();
        mockFindMany.mockResolvedValue([]);
        mockCount.mockResolvedValue(0);
    });

    it('builds an empty where-clause and skips pagination when no page is given', async () => {
        await getGear({});

        expect(mockFindMany).toHaveBeenCalledWith({
            where: {},
            orderBy: { createdAt: 'desc' },
        });
        expect(mockCount).not.toHaveBeenCalled();
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

        const { gear } = await getGear({});

        expect(gear[0].createdAt).toBe(createdAt.toISOString());
    });

    it('rethrows the original error on failure instead of wrapping it', async () => {
        const original = new Error('DB down');
        mockFindMany.mockRejectedValue(original);

        await expect(getGear({})).rejects.toBe(original);
    });

    it('applies skip/take and counts total pages when a page is given', async () => {
        mockCount.mockResolvedValue(25);

        const result = await getGear({ page: 2 });

        expect(mockFindMany).toHaveBeenCalledWith({
            where: {},
            orderBy: { createdAt: 'desc' },
            skip: 12,
            take: 12,
        });
        expect(mockCount).toHaveBeenCalledWith({ where: {} });
        expect(result.totalPages).toBe(3);
        expect(result.page).toBe(2);
    });

    it('treats a non-positive page as unpaginated', async () => {
        const result = await getGear({ page: 0 });

        expect(mockFindMany).toHaveBeenCalledWith({
            where: {},
            orderBy: { createdAt: 'desc' },
        });
        expect(result.totalPages).toBe(1);
        expect(result.page).toBe(1);
    });
});
