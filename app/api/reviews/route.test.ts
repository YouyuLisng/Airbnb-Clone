// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';
import { POST } from './route';

vi.mock('@/app/actions/getCurrentUser');

vi.mock('@/app/libs/prismadb', () => ({
    default: {
        rental: { findUnique: vi.fn() },
        review: { create: vi.fn() },
        notification: { create: vi.fn() },
    },
}));

const mockGetCurrentUser = getCurrentUser as unknown as ReturnType<typeof vi.fn>;
const mockFindUnique = prisma.rental.findUnique as unknown as ReturnType<typeof vi.fn>;
const mockCreate = prisma.review.create as unknown as ReturnType<typeof vi.fn>;
const mockCreateNotification = prisma.notification.create as unknown as ReturnType<typeof vi.fn>;

const validBody = {
    rentalId: 'rental-1',
    rating: 5,
    comment: '裝備狀況很好，出租者也很親切！',
};

const pastRental = {
    id: 'rental-1',
    userId: 'user-1',
    gearId: 'gear-1',
    endDate: new Date('2020-01-01'),
    review: null,
    gear: { userId: 'owner-1', title: '帳篷' },
};

function makeRequest(body: unknown) {
    return new Request('http://localhost/api/reviews', {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

describe('POST /api/reviews', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
        mockFindUnique.mockResolvedValue(pastRental);
        mockCreate.mockResolvedValue({ id: 'review-1' });
    });

    it('does not create a review when not logged in', async () => {
        mockGetCurrentUser.mockResolvedValue(null);

        await POST(makeRequest(validBody));

        expect(mockCreate).not.toHaveBeenCalled();
    });

    it('rejects a rating outside 1-5', async () => {
        const res = await POST(makeRequest({ ...validBody, rating: 6 }));

        expect(res.status).toBe(400);
        expect(mockCreate).not.toHaveBeenCalled();
    });

    it('rejects a missing comment', async () => {
        const { comment, ...bodyWithoutComment } = validBody;

        const res = await POST(makeRequest(bodyWithoutComment));

        expect(res.status).toBe(400);
        expect(mockCreate).not.toHaveBeenCalled();
    });

    it('rejects when the rental belongs to someone else', async () => {
        mockFindUnique.mockResolvedValue({ ...pastRental, userId: 'someone-else' });

        const res = await POST(makeRequest(validBody));

        expect(res.status).toBe(404);
        expect(mockCreate).not.toHaveBeenCalled();
    });

    it('rejects when the rental has not ended yet', async () => {
        mockFindUnique.mockResolvedValue({ ...pastRental, endDate: new Date('2999-01-01') });

        const res = await POST(makeRequest(validBody));

        expect(res.status).toBe(400);
        expect(mockCreate).not.toHaveBeenCalled();
    });

    it('rejects when the rental already has a review', async () => {
        mockFindUnique.mockResolvedValue({ ...pastRental, review: { id: 'existing-review' } });

        const res = await POST(makeRequest(validBody));

        expect(res.status).toBe(409);
        expect(mockCreate).not.toHaveBeenCalled();
    });

    it('creates a review when everything checks out', async () => {
        const res = await POST(makeRequest(validBody));

        expect(res.status).toBe(200);
        expect(mockCreate).toHaveBeenCalledWith({
            data: {
                rentalId: 'rental-1',
                gearId: 'gear-1',
                userId: 'user-1',
                rating: 5,
                comment: validBody.comment,
            },
        });
        expect(mockCreateNotification).toHaveBeenCalledWith({
            data: expect.objectContaining({
                userId: 'owner-1',
                type: 'review_received',
            }),
        });
    });
});
