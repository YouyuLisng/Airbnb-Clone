import { describe, it, expect, vi, beforeEach } from 'vitest';

import prisma from '@/app/libs/prismadb';
import getReservations from './getReservations';

vi.mock('@/app/libs/prismadb', () => ({
    default: {
        reservation: {
            findMany: vi.fn(),
        },
    },
}));

const mockFindMany = prisma.reservation.findMany as unknown as ReturnType<typeof vi.fn>;

describe('getReservations', () => {
    beforeEach(() => {
        mockFindMany.mockReset();
        mockFindMany.mockResolvedValue([]);
    });

    it('filters by listingId', async () => {
        await getReservations({ listingId: 'listing-1' });

        const { where } = mockFindMany.mock.calls[0][0];
        expect(where).toEqual({ listingId: 'listing-1' });
    });

    it('filters by userId', async () => {
        await getReservations({ userId: 'user-1' });

        const { where } = mockFindMany.mock.calls[0][0];
        expect(where).toEqual({ userId: 'user-1' });
    });

    it('filters by authorId via a nested listing.userId condition', async () => {
        await getReservations({ authorId: 'author-1' });

        const { where } = mockFindMany.mock.calls[0][0];
        expect(where).toEqual({ listing: { userId: 'author-1' } });
    });

    it('serializes date fields on the returned reservations', async () => {
        const createdAt = new Date('2026-01-01T00:00:00.000Z');
        const startDate = new Date('2026-01-02T00:00:00.000Z');
        const endDate = new Date('2026-01-03T00:00:00.000Z');

        mockFindMany.mockResolvedValue([{
            id: 'r1',
            createdAt,
            startDate,
            endDate,
            listing: { id: 'l1', createdAt },
        }]);

        const [reservation] = await getReservations({});

        expect(reservation.createdAt).toBe(createdAt.toISOString());
        expect(reservation.startDate).toBe(startDate.toISOString());
        expect(reservation.endDate).toBe(endDate.toISOString());
        expect(reservation.listing.createdAt).toBe(createdAt.toISOString());
    });

    it('rethrows the original error on failure instead of wrapping it', async () => {
        const original = new Error('DB down');
        mockFindMany.mockRejectedValue(original);

        await expect(getReservations({})).rejects.toBe(original);
    });
});
