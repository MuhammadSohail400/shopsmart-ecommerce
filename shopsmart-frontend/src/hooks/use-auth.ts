import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';

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
  // Check if we have an active session or access token
  // To prevent unnecessary 401s on initial load for guests, we can check localStorage (handled manually in layout)
  // or just let it fire and fail silently. 
  // We'll let it fire if we have an access token OR if we think there's a session.
  const isServer = typeof window === 'undefined';
  const hasSession = !isServer && localStorage.getItem('has_session') === 'true';
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery<User>({
    queryKey: ['current-user'],
    queryFn: () => apiClient<User>('/users/me'),
    retry: false,
    enabled: !!accessToken || hasSession,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
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
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      queryClient.setQueryData(['current-user'], data.user);
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
      // Redirect or handle logout in components
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
    },
    onError: (error: unknown) => {
      // @ts-expect-error type casting for api error
      toast.error(error instanceof Error ? error.userMessage || error.message : 'Failed to revoke session');
    },
  });
}
