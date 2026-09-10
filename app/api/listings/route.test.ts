// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';
import { POST } from './route';

vi.mock('@/app/actions/getCurrentUser');

vi.mock('@/app/libs/prismadb', () => ({
    default: {
        listing: { create: vi.fn() },
    },
}));

const mockGetCurrentUser = getCurrentUser as unknown as ReturnType<typeof vi.fn>;
const mockCreate = prisma.listing.create as unknown as ReturnType<typeof vi.fn>;

const validBody = {
    title: 'A nice place',
    description: 'Cozy',
    imageSrc: 'https://example.com/a.png',
    category: 'Beach',
    roomCount: 2,
    bathroomCount: 1,
    guestCount: 4,
    location: { value: 'US' },
    price: '100',
};

function makeRequest(body: unknown) {
    return new Request('http://localhost/api/listings', {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

describe('POST /api/listings', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
        mockCreate.mockResolvedValue({ id: 'listing-1' });
    });

    it('does not create a listing when not logged in', async () => {
        mockGetCurrentUser.mockResolvedValue(null);

        await POST(makeRequest(validBody));

        expect(mockCreate).not.toHaveBeenCalled();
    });

    // Regression test: this validation used to call NextResponse.error()
    // without returning or throwing it, so the result was discarded and
    // execution fell through to prisma.listing.create() regardless.
    it('rejects with 400 and does not create a listing when a required field is missing', async () => {
        const { price, ...bodyWithoutPrice } = validBody;

        const res = await POST(makeRequest(bodyWithoutPrice));

        expect(res.status).toBe(400);
        expect(mockCreate).not.toHaveBeenCalled();
        const body = await res.json();
        expect(body.error).toContain('price');
    });

    it('creates a listing when all required fields are present', async () => {
        const res = await POST(makeRequest(validBody));

        expect(res.status).toBe(200);
        expect(mockCreate).toHaveBeenCalledWith({
            data: expect.objectContaining({
                title: validBody.title,
                locationValue: validBody.location.value,
                price: 100,
                userId: 'user-1',
            }),
        });
    });
});
