// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';
import { POST } from './route';

vi.mock('@/app/actions/getCurrentUser');

vi.mock('@/app/libs/prismadb', () => ({
    default: {
        gear: { create: vi.fn() },
    },
}));

const mockGetCurrentUser = getCurrentUser as unknown as ReturnType<typeof vi.fn>;
const mockCreate = prisma.gear.create as unknown as ReturnType<typeof vi.fn>;

const validBody = {
    title: 'MSR Hubba Hubba NX2 帳篷',
    description: '雙人四季帳，含地布',
    imageSrc: 'https://example.com/tent.png',
    category: '帳篷',
    condition: '良好',
    location: { value: 'TW' },
    depositAmount: '1000',
    pricePerDay: '250',
};

function makeRequest(body: unknown) {
    return new Request('http://localhost/api/gear', {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

describe('POST /api/gear', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
        mockCreate.mockResolvedValue({ id: 'gear-1' });
    });

    it('does not create gear when not logged in', async () => {
        mockGetCurrentUser.mockResolvedValue(null);

        await POST(makeRequest(validBody));

        expect(mockCreate).not.toHaveBeenCalled();
    });

    it('rejects with 400 and does not create gear when a required field is missing', async () => {
        const { pricePerDay, ...bodyWithoutPrice } = validBody;

        const res = await POST(makeRequest(bodyWithoutPrice));

        expect(res.status).toBe(400);
        expect(mockCreate).not.toHaveBeenCalled();
        const body = await res.json();
        expect(body.error).toContain('pricePerDay');
    });

    it('creates gear when all required fields are present', async () => {
        const res = await POST(makeRequest(validBody));

        expect(res.status).toBe(200);
        expect(mockCreate).toHaveBeenCalledWith({
            data: expect.objectContaining({
                title: validBody.title,
                locationValue: validBody.location.value,
                depositAmount: 1000,
                pricePerDay: 250,
                userId: 'user-1',
            }),
        });
    });
});
