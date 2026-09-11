// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';
import { GET, POST } from './route';

vi.mock('@/app/actions/getCurrentUser');

vi.mock('@/app/libs/prismadb', () => ({
    default: {
        rental: { findUnique: vi.fn() },
        message: { findMany: vi.fn(), create: vi.fn() },
        notification: { create: vi.fn() },
    },
}));

const mockGetCurrentUser = getCurrentUser as unknown as ReturnType<typeof vi.fn>;
const mockFindUniqueRental = prisma.rental.findUnique as unknown as ReturnType<typeof vi.fn>;
const mockFindManyMessages = prisma.message.findMany as unknown as ReturnType<typeof vi.fn>;
const mockCreateMessage = prisma.message.create as unknown as ReturnType<typeof vi.fn>;
const mockCreateNotification = prisma.notification.create as unknown as ReturnType<typeof vi.fn>;

const rental = {
    id: 'rental-1',
    userId: 'renter-1',
    gearId: 'gear-1',
    gear: { userId: 'owner-1', title: '帳篷' },
};

function makeParams() {
    return { params: Promise.resolve({ rentalId: 'rental-1' }) };
}

function makeRequest(method: string, body?: unknown) {
    return new Request('http://localhost/api/rentals/rental-1/messages', {
        method,
        body: body ? JSON.stringify(body) : undefined,
    });
}

describe('GET /api/rentals/[rentalId]/messages', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetCurrentUser.mockResolvedValue({ id: 'renter-1' });
        mockFindUniqueRental.mockResolvedValue(rental);
        mockFindManyMessages.mockResolvedValue([]);
    });

    it('rejects a non-participant', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'someone-else' });

        const res = await GET(makeRequest('GET'), makeParams());

        expect(res.status).toBe(404);
        expect(mockFindManyMessages).not.toHaveBeenCalled();
    });

    it('lists messages oldest-first for a participant', async () => {
        const res = await GET(makeRequest('GET'), makeParams());

        expect(res.status).toBe(200);
        expect(mockFindManyMessages).toHaveBeenCalledWith({
            where: { rentalId: 'rental-1' },
            include: { sender: true },
            orderBy: { createdAt: 'asc' },
        });
    });
});

describe('POST /api/rentals/[rentalId]/messages', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetCurrentUser.mockResolvedValue({ id: 'renter-1', name: 'Renter' });
        mockFindUniqueRental.mockResolvedValue(rental);
        mockCreateMessage.mockResolvedValue({ id: 'message-1', body: 'hello' });
    });

    it('rejects an empty message', async () => {
        const res = await POST(makeRequest('POST', { body: '   ' }), makeParams());

        expect(res.status).toBe(400);
        expect(mockCreateMessage).not.toHaveBeenCalled();
    });

    it('rejects a non-participant', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'someone-else', name: 'Stranger' });

        const res = await POST(makeRequest('POST', { body: 'hello' }), makeParams());

        expect(res.status).toBe(404);
        expect(mockCreateMessage).not.toHaveBeenCalled();
    });

    it('creates the message and notifies the gear owner when the renter sends it', async () => {
        const res = await POST(makeRequest('POST', { body: '  hello  ' }), makeParams());

        expect(res.status).toBe(200);
        expect(mockCreateMessage).toHaveBeenCalledWith({
            data: { rentalId: 'rental-1', senderId: 'renter-1', body: 'hello' },
        });
        expect(mockCreateNotification).toHaveBeenCalledWith({
            data: expect.objectContaining({ userId: 'owner-1', type: 'message', link: '/lending' }),
        });
    });

    it('notifies the renter when the owner sends it', async () => {
        mockGetCurrentUser.mockResolvedValue({ id: 'owner-1', name: 'Owner' });

        await POST(makeRequest('POST', { body: 'hi there' }), makeParams());

        expect(mockCreateNotification).toHaveBeenCalledWith({
            data: expect.objectContaining({ userId: 'renter-1', type: 'message', link: '/renting' }),
        });
    });
});
