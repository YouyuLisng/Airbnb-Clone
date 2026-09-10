import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import useDeleteAction from './useDeleteAction';

const refresh = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({ refresh }),
}));

vi.mock('axios');

vi.mock('react-hot-toast', () => ({
    toast: { success: vi.fn(), error: vi.fn() },
}));

describe('useDeleteAction', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deletes against the given URL prefix, toasts success and refreshes the route', async () => {
        (axios.delete as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({});

        const { result } = renderHook(() => useDeleteAction('/api/gear', 'Gear deleted'));

        act(() => {
            result.current.onDelete('gear-1');
        });

        await waitFor(() => expect(result.current.deletingId).toBe(''));

        expect(axios.delete).toHaveBeenCalledWith('/api/gear/gear-1');
        expect(toast.success).toHaveBeenCalledWith('Gear deleted');
        expect(refresh).toHaveBeenCalled();
    });

    it('sets deletingId to the id while a delete is in flight', async () => {
        let resolveDelete: (value: unknown) => void = () => {};
        (axios.delete as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
            new Promise((resolve) => { resolveDelete = resolve; })
        );

        const { result } = renderHook(() => useDeleteAction('/api/gear', 'Gear deleted'));

        act(() => {
            result.current.onDelete('gear-1');
        });

        expect(result.current.deletingId).toBe('gear-1');

        await act(async () => {
            resolveDelete({});
        });

        await waitFor(() => expect(result.current.deletingId).toBe(''));
    });

    it('toasts the server error message and clears deletingId on failure', async () => {
        (axios.delete as unknown as ReturnType<typeof vi.fn>).mockRejectedValue({
            response: { data: { error: 'Nope' } },
        });

        const { result } = renderHook(() => useDeleteAction('/api/gear', 'Gear deleted'));

        act(() => {
            result.current.onDelete('gear-1');
        });

        await waitFor(() => expect(result.current.deletingId).toBe(''));

        expect(toast.error).toHaveBeenCalledWith('Nope');
        expect(refresh).not.toHaveBeenCalled();
    });
});
