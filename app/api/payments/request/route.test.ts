// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';
import { requestPayment } from '@/app/libs/linepay';
import { POST } from './route';

vi.mock('@/app/actions/getCurrentUser');

vi.mock('@/app/libs/prismadb', () => ({
    default: {
        gear: { findUnique: vi.fn() },
        payment: { create: vi.fn(), update: vi.fn() },
    },
}));

vi.mock('@/app/libs/linepay', () => ({
    requestPayment: vi.fn(),
}));

const mockGetCurrentUser = getCurrentUser as unknown as ReturnType<typeof vi.fn>;
const mockFindUniqueGear = prisma.gear.findUnique as unknown as ReturnType<typeof vi.fn>;
const mockCreatePayment = prisma.payment.create as unknown as ReturnType<typeof vi.fn>;
const mockUpdatePayment = prisma.payment.update as unknown as ReturnType<typeof vi.fn>;
const mockRequestPayment = requestPayment as unknown as ReturnType<typeof vi.fn>;

const validBody = {
    gearId: 'gear-1',
    startDate: '2026-01-01',
    endDate: '2026-01-03',
    totalPrice: 500,
};

function makeRequest(body: unknown) {
    return new Request('http://localhost/api/payments/request', {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

describe('POST /api/payments/request', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
        mockFindUniqueGear.mockResolvedValue({
            id: 'gear-1',
            title: '帳篷',
            depositAmount: 1000,
        });
        mockCreatePayment.mockResolvedValue({ id: 'payment-1' });
        mockUpdatePayment.mockResolvedValue({});
    });

    it('does not start a checkout when not logged in', async () => {
        mockGetCurrentUser.mockResolvedValue(null);

        await POST(makeRequest(validBody));

        expect(mockCreatePayment).not.toHaveBeenCalled();
    });

    it('rejects when a required field is missing', async () => {
        const { gearId, ...bodyWithoutGearId } = validBody;

        const res = await POST(makeRequest(bodyWithoutGearId));

        expect(res.status).toBe(400);
        expect(mockCreatePayment).not.toHaveBeenCalled();
    });

    it('returns 404 when the gear does not exist', async () => {
        mockFindUniqueGear.mockResolvedValue(null);

        const res = await POST(makeRequest(validBody));

        expect(res.status).toBe(404);
        expect(mockCreatePayment).not.toHaveBeenCalled();
    });

    it('creates a pending Payment for rentalFee + gear deposit, and returns the LINE Pay checkout URL', async () => {
        mockRequestPayment.mockResolvedValue({
            returnCode: '0000',
            returnMessage: 'success',
            info: {
                transactionId: 123456,
                paymentUrl: { web: 'https://sandbox-api-pay.line.me/web/payment/wait?..', app: '' },
            },
        });

        const res = await POST(makeRequest(validBody));

        expect(mockCreatePayment).toHaveBeenCalledWith({
            data: expect.objectContaining({
                userId: 'user-1',
                gearId: 'gear-1',
                rentalFee: 500,
                depositAmount: 1000,
                totalAmount: 1500,
                status: 'pending',
            }),
        });
        expect(mockRequestPayment).toHaveBeenCalledWith(
            expect.objectContaining({ amount: 1500, currency: 'TWD' })
        );
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.paymentUrl).toBe('https://sandbox-api-pay.line.me/web/payment/wait?..');
    });

    it('marks the Payment failed and returns an error when LINE Pay declines the request', async () => {
        mockRequestPayment.mockResolvedValue({
            returnCode: '1104',
            returnMessage: 'invalid parameters',
        });

        const res = await POST(makeRequest(validBody));

        expect(res.status).toBe(502);
        expect(mockUpdatePayment).toHaveBeenCalledWith({
            where: { id: 'payment-1' },
            data: { status: 'failed' },
        });
    });

    it('marks the Payment failed and returns 500 when LINE Pay credentials are missing', async () => {
        mockRequestPayment.mockRejectedValue(new Error('LINE_PAY_CHANNEL_ID / LINE_PAY_CHANNEL_SECRET are not configured'));

        const res = await POST(makeRequest(validBody));

        expect(res.status).toBe(500);
        expect(mockUpdatePayment).toHaveBeenCalledWith({
            where: { id: 'payment-1' },
            data: { status: 'failed' },
        });
    });
});
