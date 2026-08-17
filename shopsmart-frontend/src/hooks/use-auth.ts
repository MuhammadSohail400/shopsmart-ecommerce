import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { usePendingActionStore, PendingActionType } from '@/store/pending-action-store';
import { cartService } from '@/services/cart.service';
import { toast } from 'sonner';
import { useRouter, usePathname } from 'next/navigation';

export interface Session {
  id: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  role: 'CUSTOMER' | 'ADMIN';
  firstName?: string | null;
  lastName?: string | null;
}

interface LoginResponse {
  accessToken: string;
  user: User;
}

export function useCurrentUser() {
  const isServer = typeof window === 'undefined';
  const hasSession = !isServer && localStorage.getItem('has_session') === 'true';
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery<User>({
    queryKey: ['current-user'],
    queryFn: () => apiClient<User>('/users/me'),
    retry: false,
    enabled: !!accessToken || hasSession,
    staleTime: 5 * 60 * 1000,
  });
}

export interface RequireAuthOptions {
  returnUrl?: string;
  pendingAction?: PendingActionType;
  payload?: any;
  message?: string;
}

/**
 * Unified central auth hook for accessing user state and guarding actions.
 */
export function useAuth() {
  const { data: user, isLoading } = useCurrentUser();
  const accessToken = useAuthStore((state) => state.accessToken);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = !!user || !!accessToken;

  const requireAuth = (
    actionCallback?: () => void,
    options?: RequireAuthOptions
  ): boolean => {
    if (isAuthenticated) {
      if (actionCallback) actionCallback();
      return true;
    }

    const returnUrl = options?.returnUrl || pathname || '/';
    if (options?.pendingAction) {
      usePendingActionStore.getState().setPendingAction({
        type: options.pendingAction,
        payload: options.payload,
        returnUrl,
      });
    }

    toast.info(options?.message || 'Please sign in to continue');
    const params = new URLSearchParams();
    params.set('redirect', returnUrl);
    router.push(`/login?${params.toString()}`);
    return false;
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    requireAuth,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  return useMutation({
    mutationFn: (credentials: Record<string, string>) =>
      apiClient<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    onSuccess: async (data) => {
      setAccessToken(data.accessToken);
      queryClient.setQueryData(['current-user'], data.user);

      // Merge guest cart if one existed
      const { guestCartId, clearGuestCart } = useCartStore.getState();
      if (guestCartId) {
        try {
          await cartService.mergeCart(guestCartId);
          clearGuestCart();
        } catch {
          // Ignore merge errors
        }
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: Record<string, string>) =>
      apiClient('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: () => apiClient('/auth/logout', { method: 'POST' }),
    onSettled: () => {
      clearAuth();
      queryClient.removeQueries({ queryKey: ['current-user'] });
      queryClient.removeQueries({ queryKey: ['cart'] });
      queryClient.removeQueries({ queryKey: ['wishlist'] });
      queryClient.removeQueries({ queryKey: ['orders'] });
      queryClient.removeQueries({ queryKey: ['sessions'] });
      toast.success('Signed out successfully');
    },
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (identifier: string) =>
      apiClient('/auth/password-reset/request', {
        method: 'POST',
        body: JSON.stringify({ identifier }),
      }),
  });
}

export function useConfirmPasswordReset() {
  return useMutation({
    mutationFn: (data: Record<string, string>) =>
      apiClient('/auth/password-reset/confirm', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) =>
      apiClient('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token }),
      }),
  });
}

export function useVerifyPhone() {
  return useMutation({
    mutationFn: (data: { userId: string; code: string }) =>
      apiClient('/auth/verify-phone', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  });
}

export function useSessions() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['sessions'],
    queryFn: () => apiClient<Session[]>('/auth/sessions'),
    enabled: !!accessToken,
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      apiClient(`/auth/sessions/${sessionId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session revoked');
    },
    onError: (error: unknown) => {
      // @ts-expect-error type casting for api error
      toast.error(error instanceof Error ? error.userMessage || error.message : 'Failed to revoke session');
    },
  });
}
