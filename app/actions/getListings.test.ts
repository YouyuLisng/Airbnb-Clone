import { describe, it, expect, vi, beforeEach } from 'vitest';

import prisma from '@/app/libs/prismadb';
import getListings from './getListings';

vi.mock('@/app/libs/prismadb', () => ({
    default: {
        listing: {
            findMany: vi.fn(),
        },
    },
}));

const mockFindMany = prisma.listing.findMany as unknown as ReturnType<typeof vi.fn>;

describe('getListings', () => {
    beforeEach(() => {
        mockFindMany.mockReset();
        mockFindMany.mockResolvedValue([]);
    });

    it('builds an empty where-clause when no filters are given', async () => {
        await getListings({});

        expect(mockFindMany).toHaveBeenCalledWith({
            where: {},
            orderBy: { createdAt: 'desc' },
        });
    });

    it('filters by userId and category', async () => {
        await getListings({ userId: 'user-1', category: 'Beach' });

        expect(mockFindMany).toHaveBeenCalledWith({
            where: { userId: 'user-1', category: 'Beach' },
            orderBy: { createdAt: 'desc' },
        });
    });

    it('applies gte filters for room/guest/bathroom counts', async () => {
        await getListings({ roomCount: 2, guestCount: 4, bathroomCount: 1 });

        expect(mockFindMany).toHaveBeenCalledWith({
            where: {
                roomCount: { gte: 2 },
                guestCount: { gte: 4 },
                bathroomCount: { gte: 1 },
            },
            orderBy: { createdAt: 'desc' },
        });
    });

    it('excludes listings with overlapping reservations when a date range is given', async () => {
        await getListings({ startDate: '2026-01-01', endDate: '2026-01-05' });

        const { where } = mockFindMany.mock.calls[0][0];
        expect(where.NOT.reservations.some.OR).toEqual([
            {
                endDate: { gte: '2026-01-01' },
                startDate: { lte: '2026-01-01' },
            },
            {
                startDate: { lte: '2026-01-05' },
                endDate: { gte: '2026-01-05' },
            },
        ]);
    });

    it('converts createdAt to an ISO string on each returned listing', async () => {
        const createdAt = new Date('2026-01-01T00:00:00.000Z');
        mockFindMany.mockResolvedValue([{ id: '1', createdAt }]);

        const [listing] = await getListings({});

        expect(listing.createdAt).toBe(createdAt.toISOString());
    });

    it('rethrows the original error on failure instead of wrapping it', async () => {
        const original = new Error('DB down');
        mockFindMany.mockRejectedValue(original);

        await expect(getListings({})).rejects.toBe(original);
    });
});
