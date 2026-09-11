// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';
import { DELETE, PATCH } from './route';

vi.mock('@/app/actions/getCurrentUser');

vi.mock('@/app/libs/prismadb', () => ({
    default: {
        rental: { findUnique: vi.fn(), update: vi.fn() },
        notification: { create: vi.fn() },
    },
}));

const mockGetCurrentUser = getCurrentUser as unknown as ReturnType<typeof vi.fn>;
const mockFindUnique = prisma.rental.findUnique as unknown as ReturnType<typeof vi.fn>;
const mockUpdate = prisma.rental.update as unknown as ReturnType<typeof vi.fn>;
const mockCreateNotification = prisma.notification.create as unknown as ReturnType<typeof vi.fn>;

const futureRental = {
    id: 'rental-1',
    userId: 'renter-1',
    gearId: 'gear-1',
    status: 'confirmed',
    startDate: new Date('2999-01-01'),
    endDate: new Date('2999-01-03'),
    gear: { userId: 'owner-1', title: '帳篷' },
};

function makeRequest(method: string, body?: unknown) {
    return new Request('http://localhost/api/rentals/rental-1', {
        method,
        body: body ? JSON.stringify(body) : undefined,
    });
}

function makeParams() {
    return { params: Promise.resolve({ rentalId: 'rental-1' }) };
}

describe('DELETE /api/rentals/[rentalId] (cancel)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetCurrentUser.mockResolvedValue({ id: 'renter-1' });
        mockFindUnique.mockResolvedValue(futureRental);
        mockUpdate.mockResolvedValue({ ...futureRental, status: 'cancelled' });
    });

    it('lets the renter cancel a future, still-confirmed rental (soft cancel, not a delete)', async () => {
        const res = await DELETE(makeRequest('DELETE'), makeParams());

        expect(res.status).toBe(200);
        expect(mockUpdate).toHaveBeenCalledWith({
            where: { id: 'rental-1' },
            data: { status: 'cancelled' },
        });
        expect(mockCreateNotification).toHaveBeenCalledWith({
            data: expect.objectContaining({
                userId: 'owner-1',
                type: 'rental_cancelled',
            }),
        });
    });

    it('lets the gear owner cancel it too', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'owner-1' });

        const res = await DELETE(makeRequest('DELETE'), makeParams());

        expect(res.status).toBe(200);
    });

    it('rejects a stranger', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'someone-else' });

        const res = await DELETE(makeRequest('DELETE'), makeParams());

        expect(res.status).toBe(404);
        expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('rejects cancelling a rental that has already started', async () => {
        mockFindUnique.mockResolvedValue({ ...futureRental, startDate: new Date('2020-01-01') });

        const res = await DELETE(makeRequest('DELETE'), makeParams());

        expect(res.status).toBe(400);
        expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('rejects cancelling a rental that is already cancelled', async () => {
        mockFindUnique.mockResolvedValue({ ...futureRental, status: 'cancelled' });

        const res = await DELETE(makeRequest('DELETE'), makeParams());

        expect(res.status).toBe(400);
        expect(mockUpdate).not.toHaveBeenCalled();
    });
});

describe('PATCH /api/rentals/[rentalId] (confirm return)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetCurrentUser.mockResolvedValue({ id: 'owner-1' });
        mockFindUnique.mockResolvedValue({ ...futureRental, status: 'confirmed' });
        mockUpdate.mockResolvedValue({});
    });

    it('rejects confirming return on a cancelled rental', async () => {
        mockFindUnique.mockResolvedValue({ ...futureRental, status: 'cancelled' });

        const res = await PATCH(makeRequest('PATCH', { returnCondition: '良好' }), makeParams());

        expect(res.status).toBe(400);
        expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('resolves the deposit for a confirmed rental', async () => {
        const res = await PATCH(makeRequest('PATCH', { returnCondition: '良好' }), makeParams());

        expect(res.status).toBe(200);
        expect(mockUpdate).toHaveBeenCalledWith({
            where: { id: 'rental-1' },
            data: { returnCondition: '良好', depositStatus: 'refunded' },
        });
        expect(mockCreateNotification).toHaveBeenCalledWith({
            data: expect.objectContaining({
                userId: 'renter-1',
                type: 'deposit_resolved',
            }),
        });
    });
});
