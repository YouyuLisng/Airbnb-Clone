import { describe, it, expect, vi, beforeEach } from 'vitest';

import prisma from '@/app/libs/prismadb';
import getRentals from './getRentals';

vi.mock('@/app/libs/prismadb', () => ({
    default: {
        rental: {
            findMany: vi.fn(),
        },
    },
}));

const mockFindMany = prisma.rental.findMany as unknown as ReturnType<typeof vi.fn>;

describe('getRentals', () => {
    beforeEach(() => {
        mockFindMany.mockReset();
        mockFindMany.mockResolvedValue([]);
    });

    it('filters by gearId', async () => {
        await getRentals({ gearId: 'gear-1' });

        const { where } = mockFindMany.mock.calls[0][0];
        expect(where).toEqual({ gearId: 'gear-1' });
    });

    it('filters by userId (rentals I made as a renter)', async () => {
        await getRentals({ userId: 'user-1' });

        const { where } = mockFindMany.mock.calls[0][0];
        expect(where).toEqual({ userId: 'user-1' });
    });

    it('filters by authorId via a nested gear.userId condition (incoming rentals on my gear)', async () => {
        await getRentals({ authorId: 'author-1' });

        const { where } = mockFindMany.mock.calls[0][0];
        expect(where).toEqual({ gear: { userId: 'author-1' } });
    });

    it('serializes date fields on the returned rentals', async () => {
        const createdAt = new Date('2026-01-01T00:00:00.000Z');
        const startDate = new Date('2026-01-02T00:00:00.000Z');
        const endDate = new Date('2026-01-03T00:00:00.000Z');

        mockFindMany.mockResolvedValue([{
            id: 'r1',
            createdAt,
            startDate,
            endDate,
            gear: { id: 'g1', createdAt },
        }]);

        const [rental] = await getRentals({});

        expect(rental.createdAt).toBe(createdAt.toISOString());
        expect(rental.startDate).toBe(startDate.toISOString());
        expect(rental.endDate).toBe(endDate.toISOString());
        expect(rental.gear.createdAt).toBe(createdAt.toISOString());
    });

    it('rethrows the original error on failure instead of wrapping it', async () => {
        const original = new Error('DB down');
        mockFindMany.mockRejectedValue(original);

        await expect(getRentals({})).rejects.toBe(original);
    });
});
